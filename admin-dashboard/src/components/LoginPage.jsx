import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, data.email, data.password)
        toast.success('Account created!')
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password)
        toast.success('Welcome back!')
      }
    } catch (e) {
      if (e.code === 'auth/user-not-found' && !isRegister) {
        try {
          await createUserWithEmailAndPassword(auth, data.email, data.password)
          await signInWithEmailAndPassword(auth, data.email, data.password)
          toast.success('Account created! Welcome!')
        } catch (createErr) {
          toast.error(createErr.message)
        }
      } else if (e.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password')
      } else if (e.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists')
      } else {
        toast.error(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)]" />
      <Card className="w-full max-w-md relative animate-fade-in-scale border-zinc-800/50">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <UtensilsCrossed className="w-8 h-8 text-gold" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-gold">RestoMenu</CardTitle>
          <CardDescription className="text-zinc-400">
            {isRegister ? 'Create an admin account' : 'Sign in to your admin account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@restomenu.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className={errors.password ? 'border-red-500 pr-9' : 'pr-9'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                  {isRegister ? 'Creating...' : 'Signing in...'}
                </span>
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-zinc-500 hover:text-gold transition-colors"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
