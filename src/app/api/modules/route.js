import { getModulesByCourse } from "../../functions/bd";
import { getSession } from "../../functions/sessionServer";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.login === false || !session.token || !session.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return Response.json({ error: "courseId es requerido" }, { status: 400 });
    }

    const modules = await getModulesByCourse(parseInt(courseId));
    return Response.json({ modules });
  } catch (error) {
    console.error("Error al obtener módulos:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

