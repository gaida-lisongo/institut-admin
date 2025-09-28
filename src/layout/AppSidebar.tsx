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
import useAuthStore from "@/stores/authStore";

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
  const { sections, fetchSections } = useSectionStore();
  const { annees, fetchAnnees, isLoading: anneesLoading } = useAnneeStore();
  const { menuData, fetchMenuData, user } = useAuthStore();

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [privileges, setPrivileges] = useState<Privilge[]>([]);
  const [menuAdmin, setMenuAdmin] = useState<MenuItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Fonctions de génération de menu MEMORISÉES pour éviter toute boucle
  const makeMenuUnites = React.useCallback((): NavItem[] => {
    const { unites } = menuData;
    let anneeResponsable: NavItem[] = [];

    unites.forEach(u => {
      u.responsable.forEach(r => {
        if(typeof r.anneeId === 'object') {
          const anneeRef = `Année ${r.anneeId.debut}-${r.anneeId.fin}`;
          if(!anneeResponsable.find(a => a.name === anneeRef)) {
            anneeResponsable.push({
              name: anneeRef,
              path: `/unites/${r.anneeId._id}`,
              icon: <ListIcon />,
            });
          }
        }
      });
    });

    const anneeFilterByName = [...anneeResponsable].sort((a, b) => a.name.localeCompare(b.name));
    return anneeFilterByName;
  }, [menuData]);

  const makeMenuCours = React.useCallback((): NavItem[] => {
    const { courses } = menuData;

    let anneeCours: NavItem[] = [];
    let uniqueAnnees: any[] = [];

    courses?.charges.forEach(c => {
      //check if chearge is existing in uniqueAnnees
      if(!uniqueAnnees.find(a => a._id === c.annee._id)) {
        uniqueAnnees.push({ _id: c.annee._id, debut: c.annee.debut, fin: c.annee.fin });
      }
    });

    uniqueAnnees.forEach(a => {
      anneeCours.push({ name: `Année ${a.debut}-${a.fin}`, path: `/charges/${a._id}`, icon: <ListIcon /> });
    });

    const anneeFilterByName = [...anneeCours].sort((a, b) => a.name.localeCompare(b.name));
    return anneeFilterByName;

  }, [menuData]);

  const makeMenuJuries = React.useCallback((): NavItem[] => {
    const { juries } = menuData;
    
    let anneeJuries: NavItem[] = [];
    let uniqueAnnees: any[] = [];

    juries?.jurys.forEach(j => {
      //check if chearge is existing in uniqueAnnees
      if(!uniqueAnnees.find(a => a._id === j.annee._id)) {
        uniqueAnnees.push({ _id: j.annee._id, debut: j.annee.debut, fin: j.annee.fin });
      }
    });

    uniqueAnnees.forEach(a => {
      anneeJuries.push({ name: `Année ${a.debut}-${a.fin}`, path: `/jurys/${a._id}`, icon: <ListIcon /> });
    });

    const anneeFilterByName = [...anneeJuries].sort((a, b) => a.name.localeCompare(b.name));
    return anneeFilterByName;
  }, [menuData]);

  const renderMenuItems = (
    navItems: NavItem[],
    menuKey: string
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={index}>
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

  // Mise à jour du menu quand les données changent
  useEffect(() => {

    const typesPrivileges: {
      role: string;
      category: string;
      menu: NavItem[];
    }[] = [
      {
        role: "responsable",
        category: "Unités d'Enseignement",
        menu: []
      },
      {
        role: "titulaire",
        category: "Charges Horaires",
        menu: []
      },
      {
        role: "jury",
        category: "Bureaux du Jury",
        menu: []
      }
    ];


    let allMenus: MenuItem[] = [];
    
    typesPrivileges.forEach((tp) => {
      if (tp.role === "responsable") {
        allMenus.push({
          ...tp,
          menu: makeMenuUnites()
        });
      } else if (tp.role === "titulaire") {
        allMenus.push({
          ...tp,
          menu: makeMenuCours()
        });
      } else if (tp.role === "jury") {
        allMenus.push({
          ...tp,
          menu: makeMenuJuries()
        });
      }
    });

    allMenus = [
      ...allMenus,
      {
        role: "all",
        category: "",
        menu: [{
          name: "Dashboard",
          path: "/",
          icon: <GridIcon />
        }]
      }
    ]


    setMenuAdmin(allMenus.sort((a, b) => {
      if (a.role === "all") return -1;
      if (b.role === "all") return 1;
      return 0;
    }));

    console.log("Menu Admin created:", allMenus);
    // setMenuAdmin(allMenus);
  }, [makeMenuUnites, makeMenuCours, makeMenuJuries]);

  // Charger les données du menu au montage du composant
  useEffect(() => {
    if (user && user._id) {
      console.log("Chargement des données du menu pour l'utilisateur:", user._id);
      fetchMenuData(user._id);
    }
  }, [user, fetchMenuData]);

  // Debug: Afficher les données du menu
  useEffect(() => {
    console.log("MenuData updated:", menuData);
  }, [menuData]);

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

  // Afficher un spinner pendant le chargement initial
  // if (!isInitialized) {
  //   return (
  //     <aside className="fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen w-[290px] border-r border-gray-200">
  //       <div className="flex items-center justify-center h-full">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //       </div>
  //     </aside>
  //   );
  // }

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
            {/* Menu de base toujours affiché */}
            {/* <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Navigation"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "base-menu")}
            </div> */}

            {/* Menu basé sur les privilèges */}
            {menuAdmin && menuAdmin.length > 0 ? menuAdmin.map((item, idx) => (
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

            {/* Menu "Autres" toujours affiché */}
            {/* <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Autres"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItem(othersItems, "others-menu")}
            </div> */}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;