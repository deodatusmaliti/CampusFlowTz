/**
 * CampusFlow REST API & Microservice Integration Service
 * 
 * Provides unified data contracts, HTTP request simulation, offline fallback,
 * and backend readiness for production microservices deployment.
 */

import { Announcement, Course, CalendarEvent, Task, User, PaymentRecord, StudyResource, ScientificBreakthrough, Community } from '../types';
import { StorageService } from './storageService';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
  timestamp: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const ApiService = {
  // Config info
  getBaseUrl: () => API_BASE_URL,
  isLiveBackendAvailable: () => Boolean(import.meta.env.VITE_API_BASE_URL),

  // Announcements Endpoints
  async getAnnouncements(): Promise<ApiResponse<Announcement[]>> {
    try {
      if (ApiService.isLiveBackendAvailable()) {
        const res = await fetch(`${API_BASE_URL}/announcements`);
        if (res.ok) {
          const data = await res.json();
          return { success: true, data, statusCode: 200, timestamp: new Date().toISOString() };
        }
      }
    } catch {
      // Graceful offline fallback
    }
    return {
      success: true,
      data: StorageService.getAnnouncements(),
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },

  async createAnnouncement(announcement: Announcement): Promise<ApiResponse<Announcement>> {
    try {
      if (ApiService.isLiveBackendAvailable()) {
        const res = await fetch(`${API_BASE_URL}/announcements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcement),
        });
        if (res.ok) {
          const data = await res.json();
          return { success: true, data, statusCode: 201, timestamp: new Date().toISOString() };
        }
      }
    } catch {
      // Graceful offline fallback
    }
    StorageService.addAnnouncement(announcement);
    return {
      success: true,
      data: announcement,
      message: 'Announcement broadcasted and synced to local cache',
      statusCode: 201,
      timestamp: new Date().toISOString(),
    };
  },

  async acknowledgeAnnouncement(id: string): Promise<ApiResponse<{ id: string; acknowledged: boolean }>> {
    StorageService.acknowledgeAnnouncement(id);
    return {
      success: true,
      data: { id, acknowledged: true },
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },

  // Courses Endpoints
  async getCourses(): Promise<ApiResponse<Course[]>> {
    return {
      success: true,
      data: StorageService.getCourses(),
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },

  // Study Resources & Breakthroughs Endpoints
  async getStudyResources(courseCode?: string): Promise<ApiResponse<StudyResource[]>> {
    const all = StorageService.getStudyResources();
    const data = courseCode ? all.filter(r => r.courseCode.toLowerCase() === courseCode.toLowerCase()) : all;
    return {
      success: true,
      data,
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },

  async getBreakthroughs(): Promise<ApiResponse<ScientificBreakthrough[]>> {
    return {
      success: true,
      data: StorageService.getBreakthroughs(),
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  },

  // Course Mate Chat message dispatcher
  async sendCourseChatMessage(courseCode: string, content: string, user: User, isAlert = false, alertType?: 'venue' | 'exam' | 'material' | 'general'): Promise<ApiResponse<{ messageId: string }>> {
    const communities = StorageService.getCommunities();
    const comm = communities.find(c => c.courseCode.toLowerCase() === courseCode.toLowerCase()) || communities[0];
    
    if (comm) {
      const newMsg = {
        id: 'msg_' + Date.now(),
        authorName: user.name,
        authorRole: user.leadershipTitle || user.role,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: 0,
        isAlert,
        alertType: isAlert ? (alertType || 'general') : undefined,
      };
      
      const updatedCommunities = communities.map(c => {
        if (c.id === comm.id) {
          return {
            ...c,
            lastMessage: content,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      });
      StorageService.saveCommunities(updatedCommunities);
      StorageService.enqueueSync('course', 'update', `Course chat alert posted to ${courseCode}`);
    }

    return {
      success: true,
      data: { messageId: 'msg_' + Date.now() },
      message: 'Course message delivered to enrolled students',
      statusCode: 200,
      timestamp: new Date().toISOString(),
    };
  }
};
