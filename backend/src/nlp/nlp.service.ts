import { Injectable } from '@nestjs/common';
import * as chrono from 'chrono-node';
import { ParsedTaskData } from './dto/parse-input.dto';

@Injectable()
export class NlpService {
  parseTaskInput(input: string): ParsedTaskData {
    const result: ParsedTaskData = {
      title: input.trim(),
      rawInput: input,
    };

    const lowerInput = input.toLowerCase();

    this.extractDate(input, result);
    this.extractTags(input, result);
    this.extractPriority(lowerInput, result);
    this.extractEnergyLevel(lowerInput, result);
    this.extractProject(input, result);
    this.extractRecurrence(lowerInput, result);
    this.extractDuration(lowerInput, result);
    this.cleanTitle(input, result);

    return result;
  }

  private extractDate(input: string, result: ParsedTaskData): void {
    const parsed = chrono.parseDate(input);
    if (parsed) {
      result.dueDate = parsed;
    } else {
      const relativeDate = this.parseRelativeDate(input.toLowerCase());
      if (relativeDate) {
        result.dueDate = relativeDate;
      }
    }
  }

  private parseRelativeDate(input: string): Date | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (input.includes('today')) {
      return today;
    }
    if (input.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    if (input.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    if (input.includes('next month')) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    }

    return null;
  }

  private extractTags(input: string, result: ParsedTaskData): void {
    const tagRegex = /#(\w+)/g;
    const matches = input.match(tagRegex);
    if (matches) {
      result.tags = matches.map((tag) => tag.substring(1));
    }
  }

  private extractPriority(input: string, result: ParsedTaskData): void {
    if (input.includes('high priority') || input.includes('urgent') || input.includes('important')) {
      result.priority = 5;
    } else if (input.includes('low priority') || input.includes('not urgent')) {
      result.priority = 1;
    } else if (input.includes('medium priority')) {
      result.priority = 3;
    }
  }

  private extractEnergyLevel(input: string, result: ParsedTaskData): void {
    if (input.includes('high energy') || input.includes('high-energy')) {
      result.energyLevel = 'high';
    } else if (input.includes('low energy') || input.includes('low-energy') || input.includes('easy task')) {
      result.energyLevel = 'low';
    } else if (input.includes('medium energy')) {
      result.energyLevel = 'medium';
    }
  }

  private extractProject(input: string, result: ParsedTaskData): void {
    const projectTagRegex = /#(\w+)/g;
    const matches = input.match(projectTagRegex);
    if (matches && matches.length > 0) {
      const projectTag = matches[0].substring(1);
      if (projectTag.length > 2) {
        result.projectId = projectTag;
      }
    }
  }

  private extractRecurrence(input: string, result: ParsedTaskData): void {
    if (input.includes('every day') || input.includes('daily')) {
      result.recurrence = {
        pattern: 'daily',
        interval: 1,
      };
    } else if (input.includes('every week') || input.includes('weekly')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
      };
    } else if (input.includes('every month') || input.includes('monthly')) {
      result.recurrence = {
        pattern: 'monthly',
        interval: 1,
      };
    } else if (input.includes('every monday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [1],
      };
    } else if (input.includes('every tuesday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [2],
      };
    } else if (input.includes('every wednesday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [3],
      };
    } else if (input.includes('every thursday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [4],
      };
    } else if (input.includes('every friday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [5],
      };
    } else if (input.includes('every saturday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [6],
      };
    } else if (input.includes('every sunday')) {
      result.recurrence = {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [0],
      };
    }
  }

  private extractDuration(input: string, result: ParsedTaskData): void {
    const durationRegex = /(\d+)\s*(min|mins|minute|minutes|hour|hours|hr|hrs)/i;
    const match = input.match(durationRegex);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      if (unit.includes('hour')) {
        result.estimatedDuration = value * 60;
      } else {
        result.estimatedDuration = value;
      }
    }
  }

  private cleanTitle(input: string, result: ParsedTaskData): void {
    let title = input;

    title = title.replace(/#\w+/g, '');
    title = title.replace(/\b(today|tomorrow|next week|next month)\b/gi, '');
    title = title.replace(/\b(high|low|medium)\s+priority\b/gi, '');
    title = title.replace(/\b(high|low|medium)\s+energy\b/gi, '');
    title = title.replace(/\b(urgent|important|not urgent)\b/gi, '');
    title = title.replace(/\b(every day|daily|every week|weekly|every month|monthly)\b/gi, '');
    title = title.replace(/\b(every monday|every tuesday|every wednesday|every thursday|every friday|every saturday|every sunday)\b/gi, '');
    title = title.replace(/\d+\s*(min|mins|minute|minutes|hour|hours|hr|hrs)\b/gi, '');

    const dateMatches = chrono.parse(title);
    if (dateMatches.length > 0) {
      dateMatches.forEach((match) => {
        title = title.replace(match.text, '');
      });
    }

    title = title.replace(/\s+/g, ' ').trim();

    if (title.length > 0) {
      result.title = title;
    }
  }
}

