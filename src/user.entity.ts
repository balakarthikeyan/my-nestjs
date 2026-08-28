import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
    @PrimaryGeneratedColumn()
    id!: number;

    @ApiProperty({ example: 'Alice', description: 'The user’s name' })
    @Column()
    name!: string;
}