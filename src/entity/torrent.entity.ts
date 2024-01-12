import { BaseEntity } from "./base";
import { Entity, Column } from 'typeorm'

export enum STATUS {
    IN_PROGRESS = 'in_progress',
    PAUSED = 'paused',
    FAILED = 'failed',
    completed = 'completed'
}

@Entity({ name: 'magnet_requests' })
export class MagnetRequests extends BaseEntity{
    @Column({ type: 'text' })
    link!: string

    @Column({ type: 'enum', enum: STATUS, default: STATUS.IN_PROGRESS})
    status!: STATUS

    @Column({ type: 'varchar', length: 300})
    name!: string

    @Column({ type: 'numeric'})
    size!: number

    @Column({type: 'text'})
    saved_location!: string
}