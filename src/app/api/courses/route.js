import { getCourses } from "../../functions/bd";
import { getSession } from "../../functions/sessionServer";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.login === false || !session.token || !session.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const courses = await getCourses();
    return Response.json({ courses });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

