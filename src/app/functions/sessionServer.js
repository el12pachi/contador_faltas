import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";

export async function getSession() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email || !session.user.token) {
        return {user: null, token: null, nombre: null, urlLogo: null, login:false};
    }
    return session.user;
}

