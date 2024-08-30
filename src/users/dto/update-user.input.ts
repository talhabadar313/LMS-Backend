import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {

  @Field(()=>String)
  user_id:string
  
  @Field()
   name:string

   @Field()
   email:string

   @Field()
   password:string
   
   @Field({nullable:true})
   phoneNumber:string
 
   @Field({nullable:true})
   address:string

   @Field(() => Boolean , { nullable: true })
   watchlisted: boolean;
 
   @Field({nullable:true})
   status:string
}
