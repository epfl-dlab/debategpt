// adapted from https://github.com/empiricaly/empirica/blob/e3be4058a6a43fa3b08cb2d1dcbcd42815fb9d7c/lib/%40empirica/core/src/player/react/Consent.tsx#L22
import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";

export function myConsent({ next }) {
  const player = usePlayer();

  const urlParams = new URLSearchParams(window.location.search);
  const paramsObj = Object.fromEntries(urlParams?.entries());
  const hitId = paramsObj?.hitId || "";
  const sessionId = paramsObj?.SESSION_ID || "";
  player.set("hitId", hitId);
  if (sessionId) {
    player.set("sessionId", sessionId);
    player.set("platform", "prolific");
  } else if (hitId) {
    player.set("platform", "mturk");
  } else {
    player.set("platform", "none");
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    player.set("consent", true);
    next();
  };

  const negateConsent = (event) => {
    event.preventDefault();
    player.set("consent", false);
    player.set("ended", "no consent");
  };

  return (
    <div
      className="relative h-full z-10 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-6 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="mt-3 sm:mt-5">
              <h3
                className="text-lg text-center leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                Informed Consent
              </h3>
              <div className="mt-4">
                <div className="text-sm text-gray-500 text-justify">
                  {["prolific", "mturk"].includes(player.get("platform")) ? (
                    <ul
                      style={{
                        listStyleType: "disc",
                        listStylePosition: "inside",
                      }}
                    >
                      <li>
                        {" "}
                        This activity is part of a scientific experiment at{" "}
                        <b>EPFL</b> and <b>Fondazione Bruno Kessler</b> to
                        analyze the persuasiveness of AI agents in online
                        conversations.
                      </li>
                      <li>
                        {" "}
                        Your participation in this study is entirely voluntary,
                        and{" "}
                        <b>
                          you may withdraw at any point by closing this browser
                          window.
                        </b>{" "}
                      </li>
                      <li>
                        {" "}
                        During the study, you will be asked to engage in a
                        debate on a provided topic with another participant, who
                        might be a human or an AI.
                      </li>
                      <li>
                        Your sociodemographic information, collected through a
                        survey, might be anonymously shared with your debate
                        partner during the experiment, and vice-versa.
                      </li>
                      <li>
                        There are no known or anticipated risks to participating
                        in this experiment.
                      </li>
                      <li>
                        Your platform-assigned payment ID number will be stored
                        on a secure and confidential server. We will use this ID
                        to ensure proper payment and to observe participation
                        across multiple study sessions. Apart from your payment
                        ID, there is no way for us to identify you.
                      </li>
                      <li>
                        Anonymised data will be stored indefinitely on a secure
                        and confidential server, and might be shared in academic
                        publications, scientific conferences, and
                        publicly-accessible scientific data repositories.
                      </li>
                      <li>
                        For any question, you can contact the research team by
                        emailing{" "}
                        <a
                          href="mailto:debategpt-team@groupes.epfl.ch"
                          style={{ color: "blue", textDecoration: "underline" }}
                        >
                          debategpt-team@groupes.epfl.ch
                        </a>{" "}
                        .
                      </li>
                      <br />
                      Clicking on the "I AGREE" button indicates that{" "}
                      <b>
                        you are at least 18 years of age, understand this
                        agreement, and consent to participate voluntarily.
                      </b>
                    </ul>
                  ) : (
                    <div>
                      <p>
                        Please carefully read{" "}
                        <span style={{ color: "blue" }}>
                          this information sheet
                        </span>
                        [TODO: add link] in its entirety before filling out this
                        form.
                      </p>

                      <ul
                        style={{
                          listStyleType: "disc",
                          listStylePosition: "inside",
                        }}
                      >
                        <li>
                          Your participation ID for this experiment is{" "}
                          <b>{player.get("participantIdentifier")}</b>. Please
                          note it down, as you will not be shown it again.
                        </li>
                        <li>
                          To withdraw your participation, you can fill out{" "}
                          <a
                            href="https://forms.gle/B2arbfSXVmg64XbT9"
                            style={{ color: "blue" }}
                          >
                            this anonymous form.
                          </a>
                        </li>
                      </ul>

                      <p className="mt-2">
                        {" "}
                        By clicking on "I AGREE" and continuing to play the
                        game, I consent to the collection of my data by DLAB, a
                        research laboratory at EPFL. At the same time, I declare
                        that:
                      </p>
                      <ul
                        style={{
                          listStyleType: "disc",
                          listStylePosition: "inside",
                        }}
                      >
                        <li>
                          I have been informed about the objectives and the
                          course of the project, as well as the presumed
                          effects, advantages, possible disadvantages, and
                          possible risks.
                        </li>
                        <li>
                          I understand that my personal data or samples are
                          protected and will only be used in an anonymized
                          manner.
                        </li>
                        <li>
                          I consent to the anonymization of my personal data
                          during the course of the project.
                        </li>
                        <li>
                          I understand that I will be able to withdraw my
                          consent <b>until February 29th, 2024</b> with my
                          participation ID. Therefore, if I lose my
                          participation ID, I will not be able to revoke my
                          consent.
                        </li>
                        <li>
                          <b>I am at least 18 years old.</b>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-empirica-600 text-base font-medium text-white hover:bg-empirica-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-empirica-500 sm:text-sm"
              onClick={handleSubmit}
            >
              I AGREE
            </button>
          </div>

          <div className="mt-1 justify-center">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-empirica-500 sm:text-sm"
              onClick={negateConsent}
            >
              Negate consent and withdraw from the experiment.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
