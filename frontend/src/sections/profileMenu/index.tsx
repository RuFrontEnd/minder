// // TODO: wait for matching backend features
// "use client";
// import React from "react";
// import Button from "@/components/button";
// import Frame from "@/components/frame";
// import Icon from "@/components/icon";
// import SquareButton from "@/components/squareButton";
// import { motion } from "framer-motion";
// import { tailwindColors } from "@/variables/colors";
// import * as IconTypes from "@/types/components/icon";

// export default function ProfileMenu() {
// const onClickHambugar = () => {
//   setIsProfileFrameOpen((isProfileFrameOpen) => !isProfileFrameOpen);
// }; // TODO: tmp close

// const onClickProjectsButton = async () => {
//   setIsProjectsModalOpen(true);
//   setIsProfileFrameOpen(false);
//   // await fetchProjects();
// }; // TODO: tmp close

//   return (
//     <>
//         <div className="absolute top-0 -right-20 translate-x-full">
//           <div className="relative">
//             <SquareButton
//               role="profile_menu"
//               size={32}
//               shadow
//               content={
//                 <Icon
//                   type={IconTypes.Type.bars}
//                   w={14}
//                   h={14}
//                   fill={tailwindColors.grey["1"]}
//                 />
//               }
//               onClick={onClickHambugar}
//             />
//             <motion.div
//               className={`absolute top-10 left-0`}
//               variants={{
//                 open: {
//                   display: "block",
//                   opacity: 1,
//                   y: "4px",
//                 },
//                 closed: {
//                   transitionEnd: {
//                     display: "none",
//                   },
//                   opacity: 0,
//                   y: "-2px",
//                 },
//               }}
//               initial={isProfileFrameOpen ? "open" : "closed"}
//               animate={isProfileFrameOpen ? "open" : "closed"}
//               transition={{ type: "easeInOut", duration: 0.15 }}
//             >
//               <Frame>
//                 <Button text={"Projects"} onClick={onClickProjectsButton} />
//                 <Button
//                   className="mt-2"
//                   text={"Log Out"}
//                   onClick={onClickLogOutButton}
//                   danger
//                 />
//               </Frame>
//             </motion.div>
//           </div>
//         </div>

//     </>
//   );
// }
