import UserSummary, {IUserSummary} from "@/models/user-summary";



export const createUserSummary = (data: Omit<IUserSummary, "createdAt">) => {
return UserSummary.create(data)
}