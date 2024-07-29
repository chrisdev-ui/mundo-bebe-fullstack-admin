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

const passwordValidationRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: 'El nombre es requerido' }).max(50),
    lastName: z
      .string()
      .min(1, { message: 'El apellido es requerido' })
      .max(50),
    email: z.string().email({ message: 'Correo electrónico inválido' }),
    password: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .max(16, { message: 'La contraseña no puede tener más de 16 caracteres' })
      .regex(passwordValidationRegex, {
        message:
          'Tu contraseña no es válida. Debe contener al menos una letra minúscula, una letra mayúscula, un dígito y un carácter especial'
      }),
    confirmPassword: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
      .max(16)
      .regex(passwordValidationRegex, {
        message:
          'Tu contraseña no es válida. Debe contener al menos una letra minúscula, una letra mayúscula, un dígito y un carácter especial'
      }),
    role: z.enum(['USER', 'ADMIN']).default('USER')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  })

export const RegisterForm: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER'
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Carlos Antonio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Perez Perez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="carlos@example.com"
                    {...field}
                  />
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
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Crear una cuenta
        </Button>
        <Separator />
        <Button variant="outline" className="w-full flex gap-2.5">
          <IconBrandGoogle size={25} />
          Registrarse con Google
        </Button>
        <Button variant="outline" className="w-full flex gap-2.5">
          <IconBrandInstagram size={25} />
          Registrarse con Instagram
        </Button>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/iniciar-sesion" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </form>
    </Form>
  )
}
