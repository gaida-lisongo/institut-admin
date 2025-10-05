import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Groupe from "@/models/Groupe";

export async function GET() {
    try {
        await connectToDB();
        const groupes = await Groupe.find();
        return NextResponse.json(groupes);
    } catch (error) {
        console.error("Error fetching groupes:", error);
        return NextResponse.json({ error: "Failed to fetch groupes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { designation, sessionId, resolutions, dateCreation, dateOuverture, dateFermeture, statut, description, dureeMaximale, tentativesMax } = await request.json();
        const groupe = await Groupe.create({ designation, sessionId, resolutions, dateCreation, dateOuverture, dateFermeture, statut, description, dureeMaximale, tentativesMax });
        return NextResponse.json(groupe);
    } catch (error) {
        console.error("Error creating groupe:", error);
        return NextResponse.json({ error: "Failed to create groupe" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, designation, sessionId, resolutions, dateCreation, dateOuverture, dateFermeture, statut, description, dureeMaximale, tentativesMax } = await request.json();
        const groupe = await Groupe.findByIdAndUpdate(id, { designation, sessionId, resolutions, dateCreation, dateOuverture, dateFermeture, statut, description, dureeMaximale, tentativesMax });
        return NextResponse.json(groupe);
    } catch (error) {
        console.error("Error updating groupe:", error);
        return NextResponse.json({ error: "Failed to update groupe" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const groupe = await Groupe.findByIdAndDelete(id);
        return NextResponse.json(groupe);
    } catch (error) {
        console.error("Error deleting groupe:", error);
        return NextResponse.json({ error: "Failed to delete groupe" }, { status: 500 });
    }
}