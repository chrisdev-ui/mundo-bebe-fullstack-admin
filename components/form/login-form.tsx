'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandGoogle, IconBrandInstagram } from '@tabler/icons-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
  username: z.string().min(1, { message: 'El nombre de usuario es requerido' }),
  password: z
    .string()
    .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    .max(16, { message: 'La contraseña no puede tener más de 16 caracteres' })
})

export const LoginForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de usuario o correo electrónico</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Link
          href="/recuperar-contrasena"
          className="text-sm text-right underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Button type="submit" className="w-full">
          Iniciar sesión
        </Button>
        <Separator />
        <Button variant="outline" className="w-full flex gap-2.5">
          <IconBrandGoogle size={25} />
          Iniciar con Google
        </Button>
        <Button variant="outline" className="w-full flex gap-2.5">
          <IconBrandInstagram size={25} />
          Iniciar con Instagram
        </Button>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/registrarse" className="underline">
            Registrarse
          </Link>
        </div>
      </form>
    </Form>
  )
}
