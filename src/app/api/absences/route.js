import { getAllAbsences, addAbsence, removeAbsence } from "../../functions/bd";
import { getSession } from "../../functions/sessionServer";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || session.login === false || !session.token || !session.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const absences = await getAllAbsences(session.token);
    return Response.json({ absences });
  } catch (error) {
    console.error("Error al obtener faltas:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.login === false || !session.token || !session.email) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { moduleId, action } = await request.json();

    if (!moduleId || !action) {
      return Response.json({ error: "moduleId y action son requeridos" }, { status: 400 });
    }

    let success = false;
    if (action === 'add') {
      success = await addAbsence(session.token, moduleId);
    } else if (action === 'remove') {
      success = await removeAbsence(session.token, moduleId);
    } else {
      return Response.json({ error: "action debe ser 'add' o 'remove'" }, { status: 400 });
    }

    if (success) {
      const absences = await getAllAbsences(session.token);
      return Response.json({ success: true, absences });
    } else {
      return Response.json({ error: "No se pudo realizar la acción" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error al gestionar faltas:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

