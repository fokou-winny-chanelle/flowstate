import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueueService } from '../email-queue/email-queue.service';
import { AddMemberDto, ProjectRole } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueue: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectEntity> {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
        progress: 0.0,
        deadline: createProjectDto.deadline ? new Date(createProjectDto.deadline) : null,
      },
    });

    await this.prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId,
        role: ProjectRole.OWNER,
      },
    });

    return this.mapToEntity(project);
  }

  async findAll(userId: string): Promise<ProjectEntity[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return projects.map((p) => this.mapToEntity(p));
  }

  async findOne(id: string, userId: string): Promise<ProjectEntity> {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return this.mapToEntity(project);
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectEntity> {
    await this.ensureAccess(id, userId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    const updateData: {
      name?: string;
      description?: string;
      color?: string;
      deadline?: Date;
    } = {};

    if (updateProjectDto.name !== undefined) {
      updateData.name = updateProjectDto.name;
    }
    if (updateProjectDto.description !== undefined) {
      updateData.description = updateProjectDto.description;
    }
    if (updateProjectDto.color !== undefined) {
      updateData.color = updateProjectDto.color;
    }
    if (updateProjectDto.deadline !== undefined) {
      updateData.deadline = new Date(updateProjectDto.deadline);
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.ensureAccess(id, userId, [ProjectRole.OWNER]);

    await this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addMember(
    projectId: string,
    addMemberDto: AddMemberDto,
    userId: string,
  ): Promise<void> {
    await this.ensureAccess(projectId, userId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const invitedUser = await this.prisma.user.findUnique({
      where: { email: addMemberDto.email },
    });

    if (!invitedUser) {
      throw new NotFoundException(`User with email ${addMemberDto.email} not found`);
    }

    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: invitedUser.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role: addMemberDto.role,
      },
    });

    await this.sendProjectInvitationEmail(
      project,
      invitedUser,
      addMemberDto.role,
    );
  }

  private async sendProjectInvitationEmail(
    project: any,
    invitedUser: any,
    role: ProjectRole,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
      
      await this.emailQueue.addProjectInvitationEmail(invitedUser.email, {
        inviteeName: invitedUser.fullName || 'there',
        inviterName: project.owner.fullName || 'A FlowState user',
        projectName: project.name,
        projectDescription: project.description || 'No description provided',
        role,
        progress: Math.round(project.progress),
        deadline: project.deadline 
          ? new Date(project.deadline).toLocaleDateString() 
          : 'No deadline set',
        acceptUrl: `${frontendUrl}/projects/${project.id}`,
      });
    } catch (error) {
      console.error('Failed to send project invitation email:', error);
    }
  }

  async removeMember(projectId: string, memberUserId: string, userId: string): Promise<void> {
    await this.ensureAccess(projectId, userId, [ProjectRole.OWNER, ProjectRole.ADMIN]);

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId,
        },
      },
    });
  }

  async getMembers(projectId: string, userId: string) {
    await this.findOne(projectId, userId);

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      fullName: m.user.fullName,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async getTasks(projectId: string, userId: string) {
    await this.findOne(projectId, userId);

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      dueDate: task.dueDate,
      priority: task.priority,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));
  }

  async updateProgress(projectId: string, userId: string): Promise<number> {
    await this.findOne(projectId, userId);

    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
    });

    if (tasks.length === 0) {
      const progress = 0;
      await this.prisma.project.update({
        where: { id: projectId },
        data: { progress },
      });
      return progress;
    }

    const completed = tasks.filter((t) => t.isCompleted).length;
    const progress = Math.round((completed / tasks.length) * 100 * 100) / 100;

    await this.prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });

    return progress;
  }

  private async ensureAccess(
    projectId: string,
    userId: string,
    allowedRoles: ProjectRole[],
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.userId === userId) {
      return;
    }

    const member = project.members[0];
    if (!member || !allowedRoles.includes(member.role as ProjectRole)) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
  }

  private mapToEntity(project: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    color: string;
    deadline: Date | null;
    progress: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): ProjectEntity {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      color: project.color,
      deadline: project.deadline,
      progress: project.progress,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deletedAt: project.deletedAt,
    };
  }
}

