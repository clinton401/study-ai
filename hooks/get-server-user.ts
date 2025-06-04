import {auth} from "@/auth";

 const getServerUser = async() => {
    const session = await auth();
    return session?.user;
}  

export default getServerUser