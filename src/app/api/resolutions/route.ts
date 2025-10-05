import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Resolution from "@/models/Resolution";

export async function GET() {
    try {
        await connectToDB();
        const resolutions = await Resolution.find();
        return NextResponse.json(resolutions);
    } catch (error) {
        console.error("Error fetching resolutions:", error);
        return NextResponse.json({ error: "Failed to fetch resolutions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { etudiantId, reponses, note, statut, dateDebut, dateFin, tempsEcoule } = await request.json();
        const resolution = await Resolution.create({ etudiantId, reponses, note, statut, dateDebut, dateFin, tempsEcoule });
        return NextResponse.json(resolution);
    } catch (error) {
        console.error("Error creating resolution:", error);
        return NextResponse.json({ error: "Failed to create resolution" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, etudiantId, reponses, note, statut, dateDebut, dateFin, tempsEcoule } = await request.json();
        const resolution = await Resolution.findByIdAndUpdate(id, { etudiantId, reponses, note, statut, dateDebut, dateFin, tempsEcoule }, { new: true });
        return NextResponse.json(resolution);
    } catch (error) {
        console.error("Error updating resolution:", error);
        return NextResponse.json({ error: "Failed to update resolution" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const resolution = await Resolution.findByIdAndDelete(id);
        return NextResponse.json(resolution);
    } catch (error) {
        console.error("Error deleting resolution:", error);
        return NextResponse.json({ error: "Failed to delete resolution" }, { status: 500 });
    }
}
