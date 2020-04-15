import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate
} from "typeorm";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export default class BaseDates extends BaseEntity {
  @Field()
  @CreateDateColumn({ type: "datetime" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "datetime" })
  updatedAt: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedAt = new Date();
  }
}
