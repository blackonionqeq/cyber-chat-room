import { IsNotEmpty,  } from 'class-validator'
export class RequestFriendshipDto {
	@IsNotEmpty({ message: '用户名不能为空' })
	username: string

	reason: string
}