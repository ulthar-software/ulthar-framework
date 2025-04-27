import type { Meta, StoryObj } from "@storybook/react";
import { useContext } from "react";
import { Button } from "../../components/ui/button";
import { ModalContext } from "./modal-context";
import { ModalProvider } from "./modal-provider";

const meta: Meta<typeof ModalProvider> = {
  title: "Components/Basic/ModalProvider",
  component: ModalProvider,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (story) => (
      <div className="h-screen w-screen flex items-center justify-center">
        {story()}
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ModalProvider>;

// Component to trigger modals in the stories
function ModalTrigger({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark-alt p-8 border border-gray-300 rounded-lg shadow-md">
      {children}
    </div>
  );
}

// Custom modal example
function CustomModal({ closeModal }: { closeModal: () => void }) {
  return (
    <article className="bg-dark-alt rounded p-4 flex flex-col gap-2 max-w-md w-11/12">
      <h2 className="text-xl font-bold">Custom Modal</h2>
      <p className="p-4">This is a custom modal example.</p>
      <div className="flex justify-end">
        <Button onClick={closeModal}>Close</Button>
      </div>
    </article>
  );
}

// Story with Confirmation Modal
export const WithConfirmationModal: Story = {
  render: () => (
    <ModalProvider>
      <ConfirmationModalExample />
    </ModalProvider>
  ),
};

function ConfirmationModalExample() {
  const { showConfirmationModal } = useContext(ModalContext);

  return (
    <ModalTrigger>
      <h3 className="text-lg font-semibold mb-4">Confirmation Modal Example</h3>
      <Button
        onClick={() => {
          showConfirmationModal(
            "Are you sure you want to proceed?",
            () => {
              console.log("Confirmed!");
            },
            () => {
              console.log("Cancelled!");
            },
          );
        }}
      >
        Open Confirmation Modal
      </Button>
    </ModalTrigger>
  );
}

// Story with Loading Modal
export const WithLoadingModal: Story = {
  render: () => (
    <ModalProvider>
      <LoadingModalExample />
    </ModalProvider>
  ),
};

function LoadingModalExample() {
  const { withLoadingModal } = useContext(ModalContext);

  return (
    <ModalTrigger>
      <h3 className="text-lg font-semibold mb-4">Loading Modal Example</h3>
      <Button
        onClick={() => {
          void withLoadingModal(async () => {
            // Simulate a long-running operation
            await new Promise((resolve) => setTimeout(resolve, 3000));
            console.log("Operation completed!");
          });
        }}
      >
        Start Operation with Loading
      </Button>
    </ModalTrigger>
  );
}

// Story with Custom Modal
export const WithCustomModal: Story = {
  render: () => (
    <ModalProvider>
      <CustomModalExample />
    </ModalProvider>
  ),
};

function CustomModalExample() {
  const { showModal } = useContext(ModalContext);

  return (
    <ModalTrigger>
      <h3 className="text-lg font-semibold mb-4">Custom Modal Example</h3>
      <Button
        onClick={() => {
          const [closeModal] = showModal(
            <CustomModal
              closeModal={() => {
                closeModal();
              }}
            />,
          );
        }}
      >
        Open Custom Modal
      </Button>
    </ModalTrigger>
  );
}

// Story showing multiple modals stacked
export const MultipleModals: Story = {
  render: () => (
    <ModalProvider>
      <MultipleModalsExample />
    </ModalProvider>
  ),
};

function MultipleModalsExample() {
  const { showModal, showConfirmationModal } = useContext(ModalContext);

  return (
    <ModalTrigger>
      <h3 className="text-lg font-semibold mb-4">Multiple Modals Example</h3>
      <Button
        onClick={() => {
          const [closeFirstModal] = showModal(
            <CustomModal
              closeModal={() => {
                closeFirstModal();
                // Show confirmation modal after closing the first one
                showConfirmationModal("Do you want to continue?", () => {
                  console.log("Continuing after custom modal");
                });
              }}
            />,
          );
        }}
      >
        Show Sequence of Modals
      </Button>
    </ModalTrigger>
  );
}
