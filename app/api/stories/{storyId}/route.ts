// app/api/stories/[storyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AxiosError } from 'axios';
import { nextServer } from '@/lib/api/api';

interface RouteParams {
  params: {
    storyId: string;
  };
}

// Helper to compile all cookies into a single string for the external API call
async function getServerCookiesString(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}

// Generic error logging (simplified)
function logErrorResponse(error: AxiosError) {
  console.error('API Proxy Error Status:', error.response?.status);
  console.error('API Proxy Error Data:', error.response?.data);
}

// -------- GET /api/stories/[storyId] (Proxy to external API) -------------
export async function GET(req: NextRequest, { params }: RouteParams) {
  const id = params.storyId;
  try {
    const res = await nextServer.get(`/stories/${id}`, {
      headers: {
        Cookie: await getServerCookiesString(),
      },
    });
    // Return data received from the external API
    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);
    // Return the external API's status and error message
    return NextResponse.json(
      axiosError.response?.data || { message: 'Server error during GET' },
      { status: axiosError.response?.status || 500 }
    );
  }
}

// -------- PATCH /api/stories/[storyId] (Proxy to external API, handling FormData/Files) -------------
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const id = params.storyId;
  try {
    // Read the raw FormData from the NextRequest
    const formData = await req.formData();

    // Proxy the FormData directly to the external API using nextServer (Axios)
    const res = await nextServer.patch(`/stories/${id}`, formData, {
      headers: {
        Cookie: await getServerCookiesString(),
        // Axios correctly handles the Content-Type for FormData
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);
    return NextResponse.json(
      axiosError.response?.data || { message: 'Server error during PATCH' },
      { status: axiosError.response?.status || 500 }
    );
  }
}

// -------- DELETE /api/stories/[storyId] (Proxy to external API) -------------
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const id = params.storyId;

  try {
    const res = await nextServer.delete(`/stories/${id}`, {
      headers: {
        Cookie: await getServerCookiesString(),
      },
    });
    // Use the status code from the external API, defaulting to 204 (No Content)
    return new NextResponse(null, { status: res.status || 204 });
  } catch (error) {
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);
    return NextResponse.json(
      axiosError.response?.data || { message: 'Server error during DELETE' },
      { status: axiosError.response?.status || 500 }
    );
  }
}
