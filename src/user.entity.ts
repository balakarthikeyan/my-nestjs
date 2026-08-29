import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './user.dto';

@Entity('users')
export class User {
    @ApiProperty({ example: 1, description: 'Unique identifier' })
    @PrimaryGeneratedColumn()
    id!: number;

    @ApiProperty({ example: 'Alice', description: 'User full name' })
    @Column()
    name!: string;

    @ApiProperty({ example: 'alice@example.com', description: 'Unique user email' })
    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string; // Omitted from ApiProperty so it won't leak in Swagger docs

    @ApiProperty({ enum: Role, example: Role.USER, description: 'User permissions role' })
    @Column({ type: 'text', default: Role.USER })
    role!: Role;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}