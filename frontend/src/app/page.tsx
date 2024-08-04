"use client";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Alert from "@/components/alert";
import Card from "@/components/card";
import React, { useState, useEffect } from "react";
import { cloneDeep } from "lodash";
import { ChangeEventHandler, MouseEventHandler } from "react";
import * as authAPIs from "@/apis/auth";
import * as projectAPIs from "@/apis/project";
import * as InputTypes from "@/types/components/input";
import * as AlertTypes from "@/types/components/alert";
import * as AuthTypes from "@/types/apis/auth";
import * as ProjectAPITypes from "@/types/apis/project";
import * as ProjectTypes from "@/types/project";

axios.defaults.baseURL = process.env.BASE_URL || "http://localhost:5000/api";

const isBrowser = typeof window !== "undefined";

const init = {
  authInfo: {
    account: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    password: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    email: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
  },
};

export default function HomePage() {
  const qas = isBrowser && window.location.href.includes("qas");
  const router = useRouter();

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLogIn, setIsLogin] = useState(true);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [authInfo, setAuthInfo] = useState<{
    account: {
      value: undefined | string;
      status: InputTypes.Status;
      comment: undefined | string;
    };
    password: {
      value: undefined | string;
      status: InputTypes.Status;
      comment: undefined | string;
    };
    email: {
      value: undefined | string;
      status: InputTypes.Status;
      comment: undefined | string;
    };
  }>(init.authInfo);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authMessage, setAuthMessage] = useState({
    status: AlertTypes.Type.succeess,
    text: "",
  });
  const [projects, setProjects] = useState<
    ProjectAPITypes.GetProjects["resData"]
  >([]);
  const [selectedProjectId, setSelectedProjectId] = useState<
    null | ProjectTypes.Project["id"]
  >(null);

  const fetchProjects = async () => {
    const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
      await projectAPIs.getProjecs();
    setProjects(res.data);
  };

  const verifyToken = async () => {
    if (qas) {
      setIsAccountModalOpen(true);
      return;
    }

    const token = localStorage.getItem("Authorization");

    if (token) {
      const res: AxiosResponse<AuthTypes.JWTLogin["resData"]> =
        await authAPIs.jwtLogin(token);

      if (res.data.isPass) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setIsLogin(false);
        fetchProjects();
        setIsProjectsModalOpen(true);
      } else {
        setIsAccountModalOpen(true);
      }
    } else {
      setIsAccountModalOpen(true);
    }
  };

  const onClickChangeAuthButton = (_isLogining: boolean) => {
    setIsLogin(_isLogining);
    setAuthInfo(init.authInfo);
  };

  const onClickLoginButton = async () => {
    if (qas) {
      setIsAccountModalOpen(false);
      setAuthInfo(init.authInfo);
      setIsProjectsModalOpen(true);
      return;
    }

    const _authInfo = cloneDeep(authInfo);
    if (!authInfo.account.value) {
      _authInfo.account.status = InputTypes.Status.error;
      _authInfo.account.comment = "required field.";
    }
    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
    }

    if (!authInfo.account.value || !authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "required field.";
      setAuthInfo(_authInfo);
      return;
    }

    setIsAuthorizing(true);

    const res: AxiosResponse<AuthTypes.Login["resData"], any> =
      await authAPIs.login(authInfo.account.value, authInfo.password.value);

    if (res.status === 201) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      localStorage.setItem("Authorization", res.data.token);
      setTimeout(() => {
        setAuthMessage({
          status: AlertTypes.Type.succeess,
          text: res.data.message,
        });
        setIsAuthorizing(false);
        setTimeout(async () => {
          setIsLogin(true);
          setAuthMessage((authMessage) => ({
            ...authMessage,
            text: "",
          }));
          setIsAccountModalOpen(false);
          setAuthInfo(init.authInfo);
          const res: AxiosResponse<
            ProjectAPITypes.GetProjects["resData"],
            any
          > = await projectAPIs.getProjecs();
          setProjects(res.data);
          setIsProjectsModalOpen(true);
        }, 1000);
      }, 500);
    } else {
      setTimeout(() => {
        setIsAuthorizing(false);
        setAuthMessage({
          status: AlertTypes.Type.error,
          text: res.data.message,
        });
      }, 1000);
    }
  };

  const onClickSignUpButton = async () => {
    if (qas) return;
    const _authInfo = cloneDeep(authInfo);

    const isPasswordLengthGreaterThanSix =
        authInfo.password.value && authInfo.password.value?.length >= 6,
      isEmailFormatValid =
        authInfo.email.value &&
        new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(
          authInfo.email.value
        );

    if (!authInfo.account.value) {
      _authInfo.account.status = InputTypes.Status.error;
      _authInfo.account.comment = "required field.";
    } else {
      _authInfo.account.status = InputTypes.Status.normal;
      _authInfo.account.comment = "";
    }

    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "required field.";
    } else if (!isPasswordLengthGreaterThanSix) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment =
        "length should be greater than 6 characters.";
    } else {
      _authInfo.password.status = InputTypes.Status.normal;
      _authInfo.password.comment = "";
    }

    if (!authInfo.email.value) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "requied field.";
    } else if (!isEmailFormatValid) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "invalid email format.";
    } else {
      _authInfo.email.status = InputTypes.Status.normal;
      _authInfo.email.comment = "";
    }

    setAuthInfo(_authInfo);

    if (
      !isPasswordLengthGreaterThanSix ||
      !isEmailFormatValid ||
      !authInfo.account.value ||
      !authInfo.password.value ||
      !authInfo.email.value
    )
      return;

    setIsAuthorizing(true);

    const res: AxiosResponse<AuthTypes.Register["resData"], any> =
      await authAPIs.register(
        authInfo.account.value,
        authInfo.password.value,
        authInfo.email.value
      );

    if (res.status === 201) {
      setTimeout(() => {
        setAuthMessage({
          status: AlertTypes.Type.succeess,
          text: res.data.message,
        });
        setIsAuthorizing(false);
        setAuthInfo(init.authInfo);
        setTimeout(() => {
          setIsLogin(true);
          setAuthMessage((authMessage) => ({
            ...authMessage,
            text: "",
          }));
        }, 1500);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsAuthorizing(false);
        setAuthMessage({
          status: AlertTypes.Type.error,
          text: res.data.message,
        });
      }, 1000);
    }
  };

  const onChangeAccount: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.account.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.password.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.email.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onClickProjectCard = (id: ProjectTypes.Project["id"]) => {
    setSelectedProjectId(id);
  };

  const onClickConfrimProject = async (id: ProjectTypes.Project["id"]) => {
    const res: AxiosResponse<ProjectAPITypes.GetProject["resData"], any> =
      await projectAPIs.getProject(id);
    const projectData = res.data as ProjectAPITypes.ProjectData;

    router.push(`/${projectData.projectId}`);
  };

  const onClickDeleteProject = async (id: ProjectTypes.Project["id"]) => {
    const res: AxiosResponse<ProjectAPITypes.DeleteProject["resData"]> =
      await projectAPIs.deleteProject(id);

    if (id === selectedProjectId) {
      setSelectedProjectId(null);
      setProjects(
        cloneDeep(projects).filter((project) => project.id !== res.data.id)
      );
    }
  };

  const onClickNewProjectButton = async () => {
    if (qas) {
      setIsProjectsModalOpen(false);
      return;
    }
    const newProject: AxiosResponse<ProjectAPITypes.CreateProject["resData"]> =
      await projectAPIs.createProject();

    router.push(`/${newProject.data.id}`);
  };

  const onClickProjectsModalX = () => {
    setIsProjectsModalOpen(false);
  };

  const onClickLogOutButton = () => {
    localStorage.removeItem("Authorization");
    setIsLogin(true);
    setProjects([]);
    setSelectedProjectId(null);
    setAuthInfo(init.authInfo);
    setIsProjectsModalOpen(false);
    setIsAccountModalOpen(true);
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <>
      <Modal
        isOpen={
          isAccountModalOpen && !isProjectsModalOpen && !isProjectsModalOpen
        }
        width="400px"
        mask={false}
      >
        <div className="bg-white-500 rounded-lg p-8 flex flex-col w-full shadow-lg">
          <a className="flex title-font font-medium justify-center items-center text-gray-900 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              className="w-10 h-10 text-white p-2 bg-secondary-500 rounded-full"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#FFFFFF"
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              ></path>
            </svg>
            <span className="ml-3 text-xl text-grey-1">Minder</span>
          </a>
          <Input
            className="mb-4"
            label={"Account"}
            type="text"
            name="account"
            value={authInfo.account.value}
            status={authInfo.account.status}
            comment={authInfo.account.comment}
            onChange={onChangeAccount}
          />
          <Input
            className="mb-4"
            label={"Password"}
            type="password"
            name="password"
            value={authInfo.password.value}
            status={authInfo.password.status}
            comment={authInfo.password.comment}
            onChange={onChangePassword}
          />
          {!isLogIn && (
            <Input
              className="mb-4"
              label={"Email"}
              type="email"
              name="email"
              value={authInfo.email.value}
              status={authInfo.email.status}
              comment={authInfo.email.comment}
              onChange={onChangeEmail}
            />
          )}
          <Button
            className="text-lg"
            text={isLogIn ? "Login" : "Sign Up"}
            onClick={isLogIn ? onClickLoginButton : onClickSignUpButton}
            loading={isAuthorizing}
          />
          {authMessage.text && (
            <Alert
              className="mt-2"
              type={authMessage.status}
              text={authMessage.text}
            />
          )}
          <p className="text-xs text-gray-500 mt-3">
            {isLogIn ? "No account yet? " : "Already have an account? "}
            <a
              className="text-info-500 cursor-pointer"
              onClick={() => {
                onClickChangeAuthButton(!isLogIn);
              }}
            >
              {isLogIn ? "Sign up" : "Login"}
            </a>
          </p>
        </div>
      </Modal>
      <Modal isOpen={isProjectsModalOpen} width="1120px" mask={false}>
        <div className="shadow-lg">
          <section className="rounded-lg text-gray-600 bg-white-500 p-8 body-font">
            <div className="mb-6 pb-3 ps-4 border-b border-grey-5 flex justify-between items-end">
              <h2 className="text-gray-900 title-font text-lg font-semibold">
                Projects
              </h2>
              <Button onClick={onClickNewProjectButton} text={"New Project"} />
            </div>
            <div className="grid grid-cols-3 gap-4 h-[500px] overflow-auto">
              {projects.map((project) => (
                <div>
                  <Card
                    className="cursor-pointer"
                    key={project.id}
                    text={
                      <h2 className="title-font text-lg font-medium">
                        {project.name}
                      </h2>
                    }
                    selected={selectedProjectId === project.id}
                    src={project.img}
                    onClick={() => {
                      onClickProjectCard(project.id);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6 pt-3 border-t border-grey-5">
              <Button
                className="me-3"
                onClick={onClickLogOutButton}
                text={"Log Out"}
                danger
              />
              <div className="flex">
                <Button
                  className="me-3"
                  onClick={() => {
                    if (!selectedProjectId) return;
                    onClickDeleteProject(selectedProjectId);
                  }}
                  text={"Delete"}
                  disabled={selectedProjectId === null}
                  danger
                />
                <Button
                  onClick={() => {
                    if (!selectedProjectId) return;
                    onClickConfrimProject(selectedProjectId);
                  }}
                  text={"Confirm"}
                  disabled={selectedProjectId === null}
                />
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
