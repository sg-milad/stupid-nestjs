import { Entity, Column, PrimaryColumn, Unique } from 'typeorm';

@Entity('customers')
@Unique(['firstName', 'lastName', 'dateOfBirth'])
export class CustomerEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 20 })
  phoneNumber: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 50 })
  bankAccountNumber: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
