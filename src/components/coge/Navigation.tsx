'use client';

import { useState } from 'react';
import { Building2, FileText } from 'lucide-react';
import EditEtab from './EditEtab';
import ReportEtab from './ReportEtab';

interface NavigationCogeProps {
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    designation: string;
    setDesignation: (value: string) => void;
    sigle: string;
    setSigle: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    logo: string;
    setLogo: (value: string) => void;
    displayLogo: string;
    isUploadingLogo: boolean;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
    handleCancel: () => void;
    isSaving: boolean;
    etablissementId: string;
}

type TabType = 'edit' | 'report';

const NavigationCoge = (props: NavigationCogeProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('edit');

    const tabs = [
        {
            id: 'edit' as TabType,
            label: 'Éditer l\'établissement',
            icon: Building2,
            description: 'Modifier les informations de l\'établissement'
        },
        {
            id: 'report' as TabType,
            label: 'Envoyer un rapport',
            icon: FileText,
            description: 'Créer et envoyer des rapports'
        }
    ];

    return (
        <div className="w-full">
            {/* Navigation par onglets */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                        }
                                    `}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Contenu des onglets */}
            <div className="w-full">
                {activeTab === 'edit' && (
                    <EditEtab
                        isEditing={props.isEditing}
                        setIsEditing={props.setIsEditing}
                        designation={props.designation}
                        setDesignation={props.setDesignation}
                        sigle={props.sigle}
                        setSigle={props.setSigle}
                        description={props.description}
                        setDescription={props.setDescription}
                        logo={props.logo}
                        setLogo={props.setLogo}
                        displayLogo={props.displayLogo}
                        isUploadingLogo={props.isUploadingLogo}
                        handleLogoUpload={props.handleLogoUpload}
                        handleSave={props.handleSave}
                        handleCancel={props.handleCancel}
                        isSaving={props.isSaving}
                    />
                )}
                
                {activeTab === 'report' && (
                    <ReportEtab etablissementId={props.etablissementId} />
                )}
            </div>
        </div>
    );
};

export default NavigationCoge;