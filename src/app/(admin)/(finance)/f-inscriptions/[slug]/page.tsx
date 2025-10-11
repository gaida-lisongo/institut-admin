import FraisRepartitionManager from "@/components/frais/FraisRepartitionManager";

interface PageProps {
    params: {
        slug: string;
    };
}

const PageFraisRepartition = ({ params }: PageProps) => {
    return (
        <div>
            <FraisRepartitionManager fraisId={params.slug} />
        </div>
    );
};

export default PageFraisRepartition;