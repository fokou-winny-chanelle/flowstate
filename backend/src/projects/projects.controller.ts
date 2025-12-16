import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { ProjectEntity } from './entities/project.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    description: 'The project has been successfully created.',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: { id: string }) {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all projects.',
    type: [ProjectEntity],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({
    status: 200,
    description: 'The project found.',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully updated.',
    type: ProjectEntity,
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.update(id, updateProjectDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({
    status: 200,
    description: 'The project has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectsService.remove(id, user.id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a project' })
  @ApiResponse({
    status: 201,
    description: 'Member has been added successfully.',
  })
  @ApiResponse({ status: 404, description: 'Project or user not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'User is already a member.' })
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.addMember(id, addMemberDto, user.id);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiResponse({
    status: 200,
    description: 'Member has been removed successfully.',
  })
  @ApiResponse({ status: 404, description: 'Project or member not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.projectsService.removeMember(id, memberId, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a project' })
  @ApiResponse({
    status: 200,
    description: 'List of project members.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          email: { type: 'string' },
          fullName: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['owner', 'admin', 'member', 'viewer'] },
          joinedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getMembers(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectsService.getMembers(id, user.id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiResponse({
    status: 200,
    description: 'List of project tasks.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getTasks(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectsService.getTasks(id, user.id);
  }

  @Post(':id/update-progress')
  @ApiOperation({ summary: 'Update project progress based on completed tasks' })
  @ApiResponse({
    status: 200,
    description: 'Progress has been updated.',
    schema: {
      type: 'object',
      properties: {
        progress: { type: 'number', example: 75.5, description: 'Progress percentage (0-100)' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateProgress(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.projectsService.updateProgress(id, user.id).then((progress) => ({ progress }));
  }
}

