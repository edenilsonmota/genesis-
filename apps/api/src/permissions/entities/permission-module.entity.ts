import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("permission_modules")
export class PermissionModule {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ unique: true }) key: string;
  @Column() name: string;
  @Column() description: string;
  @Column() category: string;
  @Column({ default: "active" }) status: string;
}
