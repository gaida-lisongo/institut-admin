import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Etudiant from "@/models/Etudiant";

export async function GET() {
    try {
        await connectToDB();
        const etudiants = await Etudiant.find();
        return NextResponse.json(etudiants);
    } catch (error) {
        console.error("Error fetching etudiants:", error);
        return NextResponse.json({ error: "Failed to fetch etudiants" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { nom, prenom, email, sexe, classeId } = await request.json();
        const etudiant = await Etudiant.create({ nom, prenom, email, sexe, classeId });
        return NextResponse.json(etudiant);
    } catch (error) {
        console.error("Error creating etudiant:", error);
        return NextResponse.json({ error: "Failed to create etudiant" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, nom, prenom, email, sexe, classeId } = await request.json();
        const etudiant = await Etudiant.findByIdAndUpdate(id, { nom, prenom, email, sexe, classeId });
        return NextResponse.json(etudiant);
    } catch (error) {
        console.error("Error updating etudiant:", error);
        return NextResponse.json({ error: "Failed to update etudiant" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const etudiant = await Etudiant.findByIdAndDelete(id);
        return NextResponse.json(etudiant);
    } catch (error) {
        console.error("Error deleting etudiant:", error);
        return NextResponse.json({ error: "Failed to delete etudiant" }, { status: 500 });
    }
}
