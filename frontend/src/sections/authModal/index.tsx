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
import { Flex } from "@chakra-ui/react"
import * as authAPIs from "@/apis/auth";
import * as projectAPIs from "@/apis/project";
import * as InputTypes from "@/types/components/input";
import * as AlertTypes from "@/types/components/alert";
import * as AuthTypes from "@/types/apis/auth";
import * as ProjectAPITypes from "@/types/apis/project";
import * as ProjectTypes from "@/types/project";
import * as AuthModalTypes from "@/types/sections/authModal";
import styles from "./index.module.css";

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

export default function AuthModal(props: AuthModalTypes.Props) {
  const qas = isBrowser && window.location.href.includes("qas");
  const router = useRouter();

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
      await projectAPIs.getProjects();
    setProjects(res.data);
  };

  const onClickChangeAuthButton = (_isLogining: boolean) => {
    props.setIsLogin(_isLogining);
    setAuthInfo(init.authInfo);
  };

  const onClickLoginButton = async () => {
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

    if (res.status === 200) {
      setTimeout(() => {
        setAuthMessage({
          status: AlertTypes.Type.succeess,
          text: res.data.message,
        });
        setIsAuthorizing(false);
        setTimeout(async () => {
          setAuthMessage((authMessage) => ({
            ...authMessage,
            text: "",
          }));
          setAuthInfo(init.authInfo);
          !!props.afterLogin && props.afterLogin();
          // TODO: fetch projects
          // const res: AxiosResponse<
          //   ProjectAPITypes.GetProjects["resData"],
          //   any
          // > = await projectAPIs.getProjects();
          // setProjects(res.data);
          // setIsProjectsModalOpen(true);
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
    console.log('A');
    const _authInfo = cloneDeep(authInfo);
    const isPasswordLengthGreaterThanSix =
      authInfo.password.value && authInfo.password.value?.length >= 6;
    const isEmailFormatValid =
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
      _authInfo.email.comment = "required field.";
    } else if (!isEmailFormatValid) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "invalid email format.";
    } else {
      _authInfo.email.status = InputTypes.Status.normal;
      _authInfo.email.comment = "";
    }

    setAuthInfo(_authInfo);

    console.log('isPasswordLengthGreaterThanSix', isPasswordLengthGreaterThanSix);
    console.log('isEmailFormatValid', isEmailFormatValid);
    console.log('authInfo.account.value', authInfo.account.value);
    console.log('authInfo.password.value', authInfo.password.value);
    console.log('authInfo.email.value', authInfo.email.value);

    if (
      !isPasswordLengthGreaterThanSix ||
      !isEmailFormatValid ||
      !authInfo.password.value ||
      !authInfo.email.value
    )
      return;

    setIsAuthorizing(true);

    try {
      const res: AxiosResponse<AuthTypes.Register["resData"], any> =
        await authAPIs.register(
          authInfo.account.value as string,
          authInfo.email.value as string,
          authInfo.password.value as string
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
    } catch (err: any) {
      setIsAuthorizing(false);
      setAuthMessage({
        status: AlertTypes.Type.error,
        text: err?.response?.data?.message || "Registration failed.",
      });
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
      await projectAPIs.createProject("Untitled Project");

    router.push(`/${newProject.data.id}`);
  };

  const onClickProjectsModalX = () => {
    setIsProjectsModalOpen(false);
  };

  const onClickLogOutButton = () => {
    localStorage.removeItem("Authorization");
    setProjects([]);
    setSelectedProjectId(null);
    setAuthInfo(init.authInfo);
    setIsProjectsModalOpen(false);
    !!props.afterLogout && props.afterLogout();
  };

  const onClickX: MouseEventHandler<HTMLButtonElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.account.status = InputTypes.Status.normal;
    _authInfo.account.comment = undefined;
    _authInfo.password.status = InputTypes.Status.normal;
    _authInfo.password.comment = undefined;
    setAuthInfo(_authInfo);

    props.onCancel && props.onCancel(e);
  };

  useEffect(() => {
    // verifyToken();
  }, []);

  return (
    <>
      <Modal
        style={props.style}
        className={`${props.className && props.className}`}
        isOpen={
          props.isOpen
          // && !isProjectsModalOpen && !isProjectsModalOpen
        }
        title={props.isLogIn ? "Login" : "Sign Up"}
        okText={props.isLogIn ? "Login" : "Sign Up"}
        onCancel={onClickX}
        onOk={props.isLogIn ? onClickLoginButton : onClickSignUpButton}
      >
        <div className={styles.root}>
          <Input
            className={styles["emailInput"]}
            type="text"
            name="Email"
            value={authInfo.email.value}
            status={authInfo.email.status}
            comment={authInfo.email.comment}
            onChange={onChangeEmail}
          />
          <Input
            className={styles["passwordInput"]}
            type="password"
            name="Password"
            value={authInfo.password.value}
            status={authInfo.password.status}
            comment={authInfo.password.comment}
            onChange={onChangePassword}
          />
          {!props.isLogIn && (
            <>
              <Input
                className={styles["firstNameInput"]}
                name="First Name"
              // value={authInfo.firstName.value}
              // status={authInfo.firstName.status}
              // comment={authInfo.firstName.comment}
              // onChange={onChangeFirstName}
              />
              <Input
                className={styles["lastNameInput"]}
                name="Last Name"
              // value={authInfo.lastName.value}
              // status={authInfo.lastName.status}
              // comment={authInfo.lastName.comment}
              // onChange={onChangeLastName}
              />
            </>
          )}
          {/* {!props.isLogIn && (
            <Input
              className={styles.root}label={"Email"}
              type="email"
              name="email"
              value={authInfo.email.value}
              status={authInfo.email.status}
              comment={authInfo.email.comment}
              onChange={onChangeEmail}
            />
          )} */}
          {authMessage.text && (
            <Alert
              className={styles.root}
              type={authMessage.status}
              text={authMessage.text}
            />
          )}
          {/* register switcher */}
          <Flex justify="flex-end">
            <p>
              {props.isLogIn ? "No account yet? " : "Already have an account? "}
            </p>
            <p
              className={styles.switch}
              onClick={() => {
                onClickChangeAuthButton(!props.isLogIn);
              }}
            >
              {props.isLogIn ? "Sign up" : "Login"}
            </p>
          </Flex>
        </div>
      </Modal>
      {/* <Modal isOpen={isProjectsModalOpen} mask={false}>
        <div className={styles.root}>
          <section className={styles.root}>
            <div className={styles.root}>
              <h2 className={styles.root}>Projects</h2>
              <Button onClick={onClickNewProjectButton} text={"New Project"} />
            </div>
            <div className={styles.root}>
              {projects.map((project) => (
                <div>
                  <Card
                    className={styles.root}
                    key={project.id}
                    text={<h2 className={styles.root}>{project.name}</h2>}
                    selected={selectedProjectId === project.id}
                    src={project.img}
                    onClick={() => {
                      onClickProjectCard(project.id);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className={styles.root}>
              <Button
                className={styles.root}
                onClick={onClickLogOutButton}
                text={"LogOut"}
                danger
              />
              <div className={styles.root}>
                <Button
                  className={styles.root}
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
      </Modal> */}
    </>
  );
}
