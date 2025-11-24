import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AxiosError, isAxiosError } from 'axios';

import { api } from '../../api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function logErrorResponse(error: AxiosError) {
  console.error('API Proxy Error Status:', error.response?.status);
  console.error('API Proxy Error Data:', error.response?.data);
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: 'Story ID is required' },
      { status: 400 }
    );
  }

  try {
    const res = await api.get(`/stories/${id}`);

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (!isAxiosError(error)) {
      console.error('Non-Axios Error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);

    return NextResponse.json(
      axiosError.response?.data || {
        message: 'Server error during GET traveller profile',
      },
      { status: axiosError.response?.status || 500 }
    );
  }
}

interface RoutePatchParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/stories/[id]
export async function PATCH(req: NextRequest, { params }: RoutePatchParams) {
  const { id } = await params;
  const cookieStore = await cookies();

  try {
    const formData = await req.formData();

    const res = await api.patch(`/stories/${id}`, formData, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return NextResponse.json(res.data, { status: res.status });
  } catch (error) {
    if (!isAxiosError(error)) {
      console.error('Non-Axios Error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);

    return NextResponse.json(
      axiosError.response?.data || { message: 'Server error during PATCH' },
      { status: axiosError.response?.status || 500 }
    );
  }
}

// DELETE /api/stories/[id]
export async function DELETE(req: NextRequest, { params }: RoutePatchParams) {
  const { id } = await params;
  const cookieStore = await cookies();

  try {
    const res = await api.delete(`/stories/${id}`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
    });

    return new NextResponse(null, { status: res.status || 204 });
  } catch (error) {
    if (!isAxiosError(error)) {
      console.error('Non-Axios Error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
    const axiosError = error as AxiosError;
    logErrorResponse(axiosError);

    return NextResponse.json(
      axiosError.response?.data || { message: 'Server error during DELETE' },
      { status: axiosError.response?.status || 500 }
    );
  }
}
