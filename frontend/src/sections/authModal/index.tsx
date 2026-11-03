"use client";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import Alert from "@/components/alert";
import React, { useState, useEffect } from "react";
import { cloneDeep } from "lodash";
import { ChangeEventHandler, MouseEventHandler } from "react";
import {
  Button as ChakraButton,
  Dialog,
  Field,
  Input as ChakraInput,
} from "@chakra-ui/react";
import CloseButton from "@/components/closeButton";
import Portal from "@/components/portal";
import { AtSign, LockKeyhole, UserRound } from "lucide-react";
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
    confirmPassword: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    firstName: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    lastName: {
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
    confirmPassword: {
      value: undefined | string;
      status: InputTypes.Status;
      comment: undefined | string;
    };
    firstName: {
      value: undefined | string;
      status: InputTypes.Status;
      comment: undefined | string;
    };
    lastName: {
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
    if (!authInfo.email.value) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "Email is required.";
    }
    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
    }

    if (!authInfo.email.value || !authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "Password is required.";
      setAuthInfo(_authInfo);
      return;
    }

    setIsAuthorizing(true);

    setAuthMessage((current) => ({ ...current, text: "" }));
    try {
      const res: AxiosResponse<AuthTypes.Login["resData"], any> =
        await authAPIs.login(authInfo.email.value, authInfo.password.value);
      setIsAuthorizing(false);
      setAuthInfo(init.authInfo);
      props.afterLogin(res.data.message);
    } catch (error: unknown) {
      setIsAuthorizing(false);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message ?? "Unable to log in. Please try again."
        : "Unable to log in. Please try again.";
      setAuthMessage({
        status: AlertTypes.Type.error,
        text: message,
      });
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
    const isConfirmMatch =
      authInfo.confirmPassword.value &&
      authInfo.password.value === authInfo.confirmPassword.value;

    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "Password is required.";
    } else if (!isPasswordLengthGreaterThanSix) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment =
        "length should be greater than 6 characters.";
    } else {
      _authInfo.password.status = InputTypes.Status.normal;
      _authInfo.password.comment = "";
    }

    if (!authInfo.confirmPassword.value) {
      _authInfo.confirmPassword.status = InputTypes.Status.error;
      _authInfo.confirmPassword.comment = "Please confirm your password.";
    } else if (!isConfirmMatch) {
      _authInfo.confirmPassword.status = InputTypes.Status.error;
      _authInfo.confirmPassword.comment = "passwords do not match.";
    } else {
      _authInfo.confirmPassword.status = InputTypes.Status.normal;
      _authInfo.confirmPassword.comment = "";
    }

    if (!authInfo.email.value) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "Email is required.";
    } else if (!isEmailFormatValid) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "invalid email format.";
    } else {
      _authInfo.email.status = InputTypes.Status.normal;
      _authInfo.email.comment = "";
    }

    // first/last name validation
    if (!authInfo.firstName?.value) {
      _authInfo.firstName.status = InputTypes.Status.error;
      _authInfo.firstName.comment = "First name is required.";
    } else {
      _authInfo.firstName.status = InputTypes.Status.normal;
      _authInfo.firstName.comment = "";
    }

    if (!authInfo.lastName?.value) {
      _authInfo.lastName.status = InputTypes.Status.error;
      _authInfo.lastName.comment = "Last name is required.";
    } else {
      _authInfo.lastName.status = InputTypes.Status.normal;
      _authInfo.lastName.comment = "";
    }

    setAuthInfo(_authInfo);

    console.log('isPasswordLengthGreaterThanSix', isPasswordLengthGreaterThanSix);
    console.log('isEmailFormatValid', isEmailFormatValid);
    console.log('authInfo.password.value', authInfo.password.value);
    console.log('authInfo.email.value', authInfo.email.value);

    if (
      !isPasswordLengthGreaterThanSix ||
      !isEmailFormatValid ||
      !isConfirmMatch ||
      !authInfo.password.value ||
      !authInfo.email.value ||
      !authInfo.firstName?.value ||
      !authInfo.lastName?.value ||
      !authInfo.confirmPassword?.value
    )
      return;

    setIsAuthorizing(true);

    try {
      const res: AxiosResponse<AuthTypes.Register["resData"], any> =
        await authAPIs.register(
          authInfo.email.value as string,
          authInfo.password.value as string,
          authInfo.firstName.value as string,
          authInfo.lastName.value as string
        );

      if (res.status >= 200 && res.status < 300) {
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

  // account removed: using email as identifier

  const onChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.password.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeConfirmPassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.confirmPassword.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeFirstName: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.firstName.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeLastName: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.lastName.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.email.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onClickForgetPasswordButton = () => {
    return;
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
    // reset auth form and messages when closing the modal
    setAuthInfo(init.authInfo);
    setAuthMessage({
      status: AlertTypes.Type.succeess,
      text: "",
    });
    setIsAuthorizing(false);
    // ensure modal defaults to Login view when closed
    props.setIsLogin && props.setIsLogin(true);

    props.onCancel && props.onCancel(e);
  };

  useEffect(() => {
    // verifyToken();
  }, []);

  return (
    <>
      <Dialog.Root open={props.isOpen} placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              className={`${styles.dialogContent} ${props.className || ""}`}
              style={props.style}
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  className={styles.closeButton}
                  ariaLabel="Close sign in dialog"
                  size="sm"
                  onClick={onClickX}
                />
              </Dialog.CloseTrigger>
              <Dialog.Header className={styles.dialogHeader}>
                <div className={styles.brand} aria-label="Minder">
                  <svg
                    className={styles.brandMark}
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M16 3 30 27H2L16 3Z" fill="#2878f0" />
                    <path d="m16 13 8 14H8l8-14Z" fill="#fff" />
                    <path d="m16 13 8 14h-8V13Z" fill="#7fb5ff" />
                  </svg>
                  <span>Minder</span>
                </div>
                <Dialog.Title className={styles.dialogTitle}>
                  {props.isLogIn ? "Sign In" : "Sign Up"}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body className={styles.dialogBody}>
                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (props.isLogIn) {
                      void onClickLoginButton();
                    } else {
                      void onClickSignUpButton();
                    }
                  }}
                >
                  <Field.Root
                    invalid={Boolean(authInfo.email.comment)}
                    className={styles.field}
                  >
                    <div className={styles.inputRow}>
                      <AtSign size={16} aria-hidden="true" />
                      <ChakraInput
                        className={styles.authInput}
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        aria-label="Email"
                        value={authInfo.email.value || ""}
                        onChange={onChangeEmail}
                      />
                    </div>
                    {authInfo.email.comment && (
                      <Field.ErrorText>{authInfo.email.comment}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root
                    invalid={Boolean(authInfo.password.comment)}
                    className={styles.field}
                  >
                    <div className={styles.inputRow}>
                      <LockKeyhole size={16} aria-hidden="true" />
                      <ChakraInput
                        className={styles.authInput}
                        type="password"
                        autoComplete={
                          props.isLogIn ? "current-password" : "new-password"
                        }
                        placeholder="Password"
                        aria-label="Password"
                        value={authInfo.password.value || ""}
                        onChange={onChangePassword}
                      />
                    </div>
                    {authInfo.password.comment && (
                      <Field.ErrorText>
                        {authInfo.password.comment}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  {!props.isLogIn && (
                    <>
                      <Field.Root
                        invalid={Boolean(authInfo.confirmPassword.comment)}
                        className={styles.field}
                      >
                        <div className={styles.inputRow}>
                          <LockKeyhole size={16} aria-hidden="true" />
                          <ChakraInput
                            className={styles.authInput}
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm Password"
                            aria-label="Confirm Password"
                            value={authInfo.confirmPassword.value || ""}
                            onChange={onChangeConfirmPassword}
                          />
                        </div>
                        {authInfo.confirmPassword.comment && (
                          <Field.ErrorText>
                            {authInfo.confirmPassword.comment}
                          </Field.ErrorText>
                        )}
                      </Field.Root>
                      <Field.Root
                        invalid={Boolean(authInfo.firstName.comment)}
                        className={styles.field}
                      >
                        <div className={styles.inputRow}>
                          <UserRound size={16} aria-hidden="true" />
                          <ChakraInput
                            className={styles.authInput}
                            autoComplete="given-name"
                            placeholder="First Name"
                            aria-label="First Name"
                            value={authInfo.firstName.value || ""}
                            onChange={onChangeFirstName}
                          />
                        </div>
                        {authInfo.firstName.comment && (
                          <Field.ErrorText>
                            {authInfo.firstName.comment}
                          </Field.ErrorText>
                        )}
                      </Field.Root>
                      <Field.Root
                        invalid={Boolean(authInfo.lastName.comment)}
                        className={styles.field}
                      >
                        <div className={styles.inputRow}>
                          <UserRound size={16} aria-hidden="true" />
                          <ChakraInput
                            className={styles.authInput}
                            autoComplete="family-name"
                            placeholder="Last Name"
                            aria-label="Last Name"
                            value={authInfo.lastName.value || ""}
                            onChange={onChangeLastName}
                          />
                        </div>
                        {authInfo.lastName.comment && (
                          <Field.ErrorText>
                            {authInfo.lastName.comment}
                          </Field.ErrorText>
                        )}
                      </Field.Root>
                    </>
                  )}

                  {authMessage.text && (
                    <Alert
                      className={styles.alert}
                      type={authMessage.status}
                      text={authMessage.text}
                    />
                  )}

                  <ChakraButton
                    type="submit"
                    className={styles.submitButton}
                    disabled={isAuthorizing}
                    loading={isAuthorizing}
                  >
                    {props.isLogIn ? "Sign In" : "Sign Up"}
                  </ChakraButton>

                  {props.isLogIn && (
                    <button
                      type="button"
                      className={styles.forgotPassword}
                      onClick={onClickForgetPasswordButton}
                    >
                      Forgot Password?
                    </button>
                  )}
                </form>

                <div className={styles.switchRow}>
                  <span>
                    {props.isLogIn
                      ? "Don't have an account?"
                      : "Already have an account?"}
                  </span>
                  <button
                    type="button"
                    className={styles.switch}
                    onClick={() => onClickChangeAuthButton(!props.isLogIn)}
                  >
                    {props.isLogIn ? "Create one" : "Sign in"}
                  </button>
                </div>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
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
