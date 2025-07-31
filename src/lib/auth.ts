import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

export function getUserIdFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) return null
  
  const decoded = verifyToken(token)
  return decoded?.userId ?? null
}

// Middleware helper for protected routes
export function withAuth<T>(
  handler: (request: NextRequest, params: T, userId: string) => Promise<Response>
) {
  return async (request: NextRequest, params: T): Promise<Response> => {
    const userId = getUserIdFromRequest(request)
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return handler(request, params, userId)
  }
}

// Middleware helper for admin-only routes
export function withAdminAuth<T>(
  handler: (request: NextRequest, params: T, userId: string) => Promise<Response>
) {
  return async (request: NextRequest, params: T): Promise<Response> => {
    const userId = getUserIdFromRequest(request)
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is admin
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true }
      })
      
      if (!user?.isAdmin) {
        return Response.json({ error: 'Admin access required' }, { status: 403 })
      }
      
      return handler(request, params, userId)
    } catch (error) {
      console.error('Admin auth check error:', error)
      return Response.json({ error: 'Authentication error' }, { status: 500 })
    } finally {
      await prisma.$disconnect()
    }
  }
}