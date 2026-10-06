import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterLoginDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido es requerido' })
    lastName: string;

    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;
}