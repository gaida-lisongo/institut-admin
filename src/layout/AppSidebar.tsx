"use client";
import React, { useEffect, useRef, useState,useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  UserCircleIcon,
} from "../icons/index";
import { Privilge } from "@/types/agent";
import { useSectionStore } from "@/stores/sectionStore";
import { useAnneeStore } from "@/stores/anneeStore";
import { Annee } from "@/services/AnneeService";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type MenuItem = {
  role: string; 
  category: string; 
  menu:NavItem[];
}

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/"
  },
  {
    name: "Années",
    icon: <ListIcon />,
    path: "/annees",
  },
  {
    icon: <UserCircleIcon />,
    name: "Utilisateurs",
    subItems: [
      { name: "Agents", path: "/agents" },
      { name: "Etudiants", path: "/etudiants"}
    ],
  },
];

const othersItems: NavItem[] = [
  {
    name: "Acceuil",
    icon: <PageIcon />,
    subItems: [
      { name: "Mot du chef", path: "/mot-chef"},
      { name: "Offres", path: "/offres"},
      { name: "Calendrier", path: "/calendrier"},
    ],
  },
  {
    name: "Apropos",
    icon: <PageIcon />,
    subItems: [
      { name: "Mission", path: "/mission"},
      { name: "Valeurs", path: "/valeurs"},
      { name: "Historique", path: "/historique"},
      { name: "Alumin", path: "/alumin"},
      { name: "Equipe", path: "/equipe"},
    ],
  },
  {
    name: "Contact",
    icon: <PageIcon />,
    path: "/contact",
  },
  {
    name: "Vie Etudiante",
    icon: <PageIcon />,
    subItems: [
      { name: "Agenda", path: "/agenda"},
      { name: "Galerie", path: "/galerie"},
      // { name: "Association", path: "/association"},
      // { name: "Clubs", path: "/clubs"},
    ],
  },
];

const renderMenu = ({item, isExpanded, isHovered, isMobileOpen, renderMenuItems, menuKey} : {
  item:MenuItem, 
  isExpanded: boolean, 
  isHovered: boolean, 
  isMobileOpen: boolean, 
  renderMenuItems: (items: NavItem[], menuKey: string) => any,
  menuKey: string
}) => {
  return (    
      <div>
        <h2
          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
            !isExpanded && !isHovered
              ? "lg:justify-center"
              : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            item.category
          ) : (
            <HorizontaLDots />
          )}
        </h2>
        {renderMenuItems(item.menu, menuKey)}
      </div>
  )
};

const AppSidebar: React.FC = () => {
  const { sections } = useSectionStore();
  const { annees, fetchAnnees, isLoading: anneesLoading } = useAnneeStore();

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [privileges, setPrivileges] = useState<Privilge[]>([]);
  const [menuAdmin, setMenuAdmin] = useState<MenuItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  const makeMenuAdministration = (sectionsId: string[]): NavItem[] => {

    const adminSection: NavItem[] = [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: "/"
      }
    ];

    return adminSection;

  }

  const makeMenuEnseignement = (sectionsId: string[], anneesOrdered: Annee[]): NavItem[] => {
    const unitesSection: { name: string; path: string }[] = sectionsId.map((sectionId) => {
      const section = sections.find(sec => sec._id === sectionId);
      return {
        name: section ? `Unites ${section.description.sigle}` : "Section inconnue",
        path: section ? `/unites/${section._id}` : "/unites/inconnu",
      };
    });

    // Utiliser les années pour les charges horaires
    const anneesCharge: { name: string; path: string }[] = anneesOrdered.map((annee) => {
      return {
        name: `Charges ${annee.debut}-${annee.fin}`,
        path: `/charges/${annee._id}`,
      };
    });


    const adminSection: NavItem[] = [
      {
        icon: <PageIcon />,
        name: "Unités d'Enseignement",
        subItems: unitesSection,
      },
      {
        name: "Charges Horaires",
        icon: <PageIcon />,
        subItems: anneesCharge.length > 0 ? anneesCharge : [
          { name: "Aucune année configurée", path: "/annees" }
        ],
      }
    ];

    return adminSection;
  }

  const makeMenuRecherche = (sectionsId: string[], anneesOrdered: Annee[]): NavItem[] => {
    

    // Utiliser les années pour les charges horaires
    const thematiquesSection: { name: string; path: string }[] = anneesOrdered.map((annee) => {
      return {
        name: `Sujets ${annee.debut}-${annee.fin}`,
        path: `/sujets/${annee._id}`,
      };
    });

    // const thematiquesSection: { name: string; path: string }[] = sectionsId.map((sectionId) => {
    //   const section = sections.find(sec => sec._id === sectionId);
    //   return {
    //     name: section ? `Sujets ${section.description.sigle}` : "Section inconnue",
    //     path: section ? `/sujets/${section._id}` : "/sujets/inconnu",
    //   };
    // });
    const sujetsSection: { name: string; path: string }[] = anneesOrdered.map((annee) => {
      return {
        name: `Stages ${annee.debut}-${annee.fin}`,
        path: `/stages/${annee._id}`,
      };
    });
    // const sujetsSection: { name: string; path: string }[] = sectionsId.map((sectionId) => {
    //   const section = sections.find(sec => sec._id === sectionId);
    //   return {
    //     name: section ? `Stages ${section.description.sigle}` : "Section inconnue",
    //     path: section ? `/stages/${section._id}` : "/stages/inconnu",
    //   };
    // });

    
    // const recherchesSection: { name: string; path: string }[] = sectionsId.map((sectionId) => {
    //   const section = sections.find(sec => sec._id === sectionId);
    //   return {
    //     name: section ? `Recherche ${section.description.sigle}` : "Section inconnue",
    //     path: section ? `/recherches/${section._id}` : "/recherches/inconnu",
    //   };
    // });

    const adminSection: NavItem[] = [
      {
        icon: <PageIcon />,
        name: "Sujets de recherche",
        subItems: thematiquesSection,
      },
      {
        name: "Stages de de recherche",
        icon: <PageIcon />,
        subItems: sujetsSection,
      },
      // {
      //   icon: <PageIcon />,
      //   name: "Etats de la recherche",
      //   subItems: recherchesSection,
      // },
    ];

    return adminSection;
  }

  const makeMenuSection = (sectionsId: string[], anneesOrdered: Annee[]): NavItem[] => {
    const cyclesSection: { name: string; path: string }[] = sectionsId.map((sectionId) => {
      const section = sections.find(sec => sec._id === sectionId);
      return {
        name: section ? `Cycles ${section.description.sigle}` : "Section inconnue",
        path: section ? `/cycles/${section._id}` : "/cycles/inconnu",
      };
    });

    let jurySection: { name: string; path: string }[] = []
    anneesOrdered.map((annee) => {
      const findSections = sectionsId.map(id => sections.find(sec => sec._id === id)).filter(Boolean);
      jurySection = [...jurySection, ...findSections.map(section => ({
        name: `Jury ${section?.description.sigle} (${annee.debut}-${annee.fin})`,
        path: `/jury/${annee._id}-${section?._id || 'inconnu'}`,
      }))];
    });

    const adminSection: NavItem[] = [
      {
        icon: <PageIcon />,
        name: "Etudes",
        subItems: cyclesSection,
      },
      {
        icon: <PieChartIcon />,
        name: "Bureaux du Jury",
        subItems: jurySection,
      }
    ];

    return adminSection;
  }

  const renderMenuItems = (
    navItems: NavItem[],
    menuKey: string
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuKey)}
              className={`menu-item group  ${
                openSubmenu?.menuKey === menuKey && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.menuKey === menuKey && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.menuKey === menuKey &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuKey}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.menuKey === menuKey && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuKey}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    menuKey: string;
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // Chargement initial des données
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Charger les privilèges depuis localStorage
        const privilegesData = localStorage.getItem("privileges");
        if (privilegesData) {
          setPrivileges(JSON.parse(privilegesData));
        }

        // Charger les années
        await fetchAnnees();
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        setIsInitialized(true); // Continuer même en cas d'erreur
      }
    };

    initializeData();
  }, [fetchAnnees]);

  // Mise à jour du menu quand les données changent
  useEffect(() => {
    if (!isInitialized) return;

    console.log("Updating menu with:", { 
      privilegesLength: privileges.length, 
      anneesLength: annees.length, 
      sectionsLength: sections.length 
    });

    const sectionsId: string[] = [];
    const typesPrivileges: {
      role: string;
      category: string;
      menu: NavItem[];
    }[] = [
      {
        role: "chef",
        category: "Chef de section",
        menu: []
      },
      {
        role: "enseignement",
        category: "Enseignement",
        menu: []
      },
      {
        role: "recherche",
        category: "Recherche",
        menu: []
      }
    ];

    privileges.forEach((privilege) => {
      const typePriv = typesPrivileges.find(tp => tp.role === privilege.role);
      if (typePriv) {
        if (privilege.role === "chef" || privilege.role === "enseignement" || privilege.role === "recherche") {
          if (!sectionsId.includes(privilege.sectionId)) {
            sectionsId.push(privilege.sectionId);
          }
        }
      }
    });

    console.log("Sections ID:", sectionsId);
    let allMenus: MenuItem[] = [];
    
    typesPrivileges.forEach((tp) => {
      console.log("Creating enseignement menu with annees:", annees);
      const anneesOrdered = [...annees].sort((a, b) => b.fin - a.fin);
      if (tp.role === "chef") {
        allMenus.push({
          ...tp,
          menu: makeMenuSection(sectionsId, anneesOrdered)
        });
      } else if (tp.role === "enseignement") {
        allMenus.push({
          ...tp,
          menu: makeMenuEnseignement(sectionsId, anneesOrdered)
        });
      } else if (tp.role === "recherche") {
        allMenus.push({
          ...tp,
          menu: makeMenuRecherche(sectionsId, anneesOrdered)
        });
      }
    });

    allMenus = [...allMenus, {
      role: "all",
      category: "Direction",
      menu: makeMenuAdministration(sectionsId)
    }];

    setMenuAdmin(allMenus.sort((a, b) => {
      if (a.role === "all") return -1;
      if (b.role === "all") return 1;
      return 0;
    }));

    console.log("Menu Admin created:", allMenus);
  }, [privileges, annees, sections, isInitialized, makeMenuEnseignement, makeMenuSection]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    
    menuAdmin.forEach((menuItem, menuIdx) => {
      menuItem.menu.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                menuKey: `${menuItem.role}-${menuIdx}`,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, menuAdmin]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.menuKey}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuKey: string) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.menuKey === menuKey &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { menuKey, index };
    });
  };

  // Afficher un spinner pendant le chargement
  if (!isInitialized || anneesLoading) {
    return (
      <aside className="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen w-[290px] border-r border-gray-200">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo-dark.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {menuAdmin ? menuAdmin.map((item, idx) => (
              <div key={`${item.role}-${idx}`}>
                {renderMenu({
                  item, 
                  isExpanded, 
                  isHovered, 
                  isMobileOpen, 
                  renderMenuItems, 
                  menuKey: `${item.role}-${idx}`
                })}
              </div>
            )) : null}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;