import { Entity, Column, PrimaryColumn, BaseEntity } from "typeorm";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity("Session")
export class Session extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field()
  @Column()
  expiresAt: number;

  @Field()
  @Column({ type: "nvarchar", length: 4000 })
  data: string;
}
