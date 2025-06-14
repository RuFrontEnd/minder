// TODO: wait for matching backend features
// "use client";
// import React, {
//   useState,
//   useRef,
//   useEffect,
//   useMemo,
//   useCallback,
//   ChangeEvent,
// } from "react";
// import axios, { AxiosResponse } from "axios";
// import { useParams, useRouter } from "next/navigation";
// import Core from "@/shapes/core";
// import Terminal from "@/shapes/terminal";
// import Process from "@/shapes/process";
// import Data from "@/shapes/data";
// import Desicion from "@/shapes/decision";
// import Curve from "@/shapes/curve";
// import SelectionFrame from "@/shapes/selectionFrame";
// import Selection from "@/shapes/selection";
// import Stack from "@/dataStructure/stack";
// import SidePanel from "@/components/sidePanel";
// import Accordion from "@/components/accordion";
// import Button from "@/components/button";
// import SimpleButton from "@/components/simpleButton";
// import Modal from "@/components/modal";
// import Input from "@/components/input";
// import Select from "@/components/select";
// import Alert from "@/components/alert";
// import Card from "@/components/card";
// import Frame from "@/components/frame";
// import PencilSquareIcon from "@/assets/svg/pencil-square.svg";
// import Icon from "@/components/icon";
// import RoundButton from "@/components/roundButton";
// import StatusText from "@/components/statusText";
// import Divider from "@/components/divider";
// import SquareButton from "@/components/squareButton";
// import IndivisaulSidePanel from "@/sections/indivisualSidePanel";
// import Console from "@/sections/console";
// import Zoom from "@/sections/zoom";
// import { motion, steps } from "framer-motion";
// import { cloneDeep } from "lodash";
// import { v4 as uuidv4 } from "uuid";
// import { ChangeEventHandler, MouseEventHandler } from "react";
// import { tailwindColors } from "@/variables/colors";
// import * as statusConstants from "@/constants/stauts";
// import * as handleUtils from "@/utils/handle";
// import * as authAPIs from "@/apis/auth";
// import * as projectAPIs from "@/apis/project";
// import * as CoreTypes from "@/types/shapes/core";
// import * as CurveTypes from "@/types/shapes/curve";
// import * as CommonTypes from "@/types/common";
// import * as SelectionTypes from "@/types/shapes/selection";
// import * as PageTypes from "@/types/app/page";
// import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";
// import * as InputTypes from "@/types/components/input";
// import * as SelectTypes from "@/types/components/select";
// import * as AlertTypes from "@/types/components/alert";
// import * as IconTypes from "@/types/components/icon";
// import * as AuthTypes from "@/types/apis/auth";
// import * as ProjectAPITypes from "@/types/apis/project";
// import * as ProjectTypes from "@/types/project";
// import * as APICommonTypes from "@/types/apis/common";
// import * as PageIdTypes from "@/types/app/pageId";
// import * as SidePanelTypes from "@/types/components/sidePanel";
// import * as ButtonTypes from "@/types/components/button";
// import * as SimpleButtonTypes from "@/types/components/simpleButton";
// import * as StatusTextTypes from "@/types/components/statusText";
// import * as CheckDataTypes from "@/types/workers/checkData";

// const isBrowser = typeof window !== "undefined";

// export default function ProjectModal() {
//   const qas = isBrowser && window.location.href.includes("qas");
//   const params = useParams<{ id: string }>();
//   const router = useRouter();

//   const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
//   const [projects, setProjects] = useState<
//     ProjectAPITypes.GetProjects["resData"]
//   >([]);
//   const [selectedProjectId, setSelectedProjectId] = useState<
//     null | ProjectTypes.Project["id"]
//   >(null);
//   const [hasEnter, setHasEnter] = useState(false);

//   // TODO: wait for matching backend features
//   // const fetchProjects = async () => {
//   //   const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
//   //     await projectAPIs.getProjecs();
//   //   setProjects(res.data);
//   // };

//   const onClickProjectCard = (id: ProjectTypes.Project["id"]) => {
//     setSelectedProjectId(id);
//   };

//   const onClickConfrimProject = async (id: ProjectTypes.Project["id"]) => {
//     router.push(`/${id}`);
//   };

//   const onClickDeleteProject = async (id: ProjectTypes.Project["id"]) => {
//     try {
//       const res: AxiosResponse<ProjectAPITypes.DeleteProject["resData"]> =
//         await projectAPIs.deleteProject(id);

//       if (id === selectedProjectId) {
//         shapes = [];
//         setSelectedProjectId(null);
//         setHasEnter(false);
//         setProjects(
//           cloneDeep(projects).filter((project) => project.id !== res.data.id)
//         );
//       }
//     } catch (err) {
//       // TODO: handle error
//     }
//   };

//   const onClickNewProjectButton = async () => {
//     if (qas) {
//       setHasEnter(true);
//       setIsProjectsModalOpen(false);
//       return;
//     }
//     shapes = [];
//     const newProject: AxiosResponse<ProjectAPITypes.CreateProject["resData"]> =
//       await projectAPIs.createProject();

//     const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
//       await projectAPIs.getProjecs();

//     setIsProjectsModalOpen(false);
//     setProjects(res.data);
//     setSelectedProjectId(newProject.data.id);
//     setHasEnter(true);
//   };

//   const onClickProjectsModalX = () => {
//     setIsProjectsModalOpen(false);
//   };

//   return (
//     <>
//       <Modal
//         isOpen={isProjectsModalOpen}
//         width="1120px"
//         onClickX={onClickProjectsModalX}
//       >
//         <div>
//           <section className="rounded-lg  bg-white-500 p-8 body-font">
//             <div className="mb-6 pb-3 ps-4 border-b border-grey-5 flex justify-between items-end">
//               <h2 className="text-gray-900 title-font text-lg font-semibold">
//                 Projects
//               </h2>
//               <Button onClick={onClickNewProjectButton} text={"New Project"} />
//             </div>
//             <div className="grid grid-cols-3 gap-4 h-[500px] overflow-auto">
//               {projects.map((project) => (
//                 <div>
//                   <Card
//                     className="cursor-pointer"
//                     key={project.id}
//                     text={
//                       <h2 className="title-font text-lg font-medium">
//                         {project.name}
//                       </h2>
//                     }
//                     selected={selectedProjectId === project.id}
//                     src={project.img}
//                     onClick={() => {
//                       onClickProjectCard(project.id);
//                     }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="flex justify-end items-center mt-6 pt-3 border-t border-grey-5">
//               <Button
//                 className="me-3"
//                 onClick={() => {
//                   if (!selectedProjectId) return;
//                   onClickDeleteProject(selectedProjectId);
//                 }}
//                 text={"Delete"}
//                 disabled={selectedProjectId === null}
//                 danger
//               />
//               <Button
//                 onClick={() => {
//                   if (!selectedProjectId) return;
//                   onClickConfrimProject(selectedProjectId);
//                 }}
//                 text={"Confirm"}
//                 disabled={selectedProjectId === null}
//               />
//             </div>
//           </section>
//         </div>
//       </Modal>
//     </>
//   );
// }
