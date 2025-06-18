import React, { useState, useRef, useEffect } from "react";
import { createWorkspace, uploadWorkspaceImage, generateInviteLink } from "../Api/api";
import createworkspace from "../Logo/createworkspace.png";
import camera from "../Logo/camera.png";
import createfinishworkspace from "../Logo/createfinishworkspace.png";

interface ModalProps {
  onClose: () => void;
  token: string;
  //closedBy?: 'none' | 'closerequest'; //тестовая реализация клика в не модального окна
}

interface FormData {
  workspaceName: string;
  workspaceType: "Public" | "Private";
  workspaceDescription: string;
  profileImage?: File;
}

const MultiStepModal: React.FC<ModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    workspaceName: "",
    workspaceType: "Public",
    workspaceDescription: "",
  });
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  useEffect(() => {
    const savedData = localStorage.getItem('workspaceFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      workspaceName: formData.workspaceName,
      workspaceType: formData.workspaceType,
      workspaceDescription: formData.workspaceDescription,
    };
    localStorage.setItem('workspaceFormData', JSON.stringify(dataToSave));
  }, [formData.workspaceName, formData.workspaceType, formData.workspaceDescription]);

  const handleContinue = async () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCreating(true);
      try {
        // Создаем workspace
        const created = await createWorkspace({
          name: formData.workspaceName,
          visibility: formData.workspaceType.toLowerCase() as "public" | "private",
        });
        
        setWorkspaceId(created.id);

        if (formData.profileImage) {
          try {
            await uploadWorkspaceImage(created.id, formData.profileImage);
            console.log("Image uploaded successfully");
          } catch (imageError) {
            console.error("Error uploading image:", imageError);
          }
        }

        // Очищаем localStorage после успешного создания
        localStorage.removeItem('workspaceFormData');
        
        setCurrentStep(3);
      } catch (error: unknown) {
        if (error instanceof Error) {
          // alert(error.message);
        } else {
          console.error("Error creating workspace:", error);
          // alert("Unexpected error occurred");
        }
      } finally {
        setCreating(false);
      }
    } else if (currentStep === 3) {
      onClose();
    }
  };

  const ImageSelect = (file: File) => {
    setFormData(prev => ({ ...prev, profileImage: file }));
    const reader = new FileReader();
    reader.onloadend = () =>{
      setImagePreview(reader.result as string);
    }
    reader.readAsDataURL(file);
    console.log("Image selected:", file.name);
  };

  const copyInviteLink = async () => {
    if (!workspaceId) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error("No auth token");
      return;
    }
    try {
      const { inviteLink } = await generateInviteLink(workspaceId);
      setInviteLink(inviteLink);
      await navigator.clipboard.writeText(inviteLink);
      // alert("Link copied!");
    } catch (err) {
      console.error(err);
      // alert("Failed to copy invite link");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderStep1 = () => (
    <div>
      <label htmlFor="workspaceName">Workspace name</label>
      <input id="workspaceName" type="text" placeholder="Vlad's Co." value={formData.workspaceName}
        onChange={(e) =>
          setFormData({ ...formData, workspaceName: e.target.value })
        }/>
      <label htmlFor="workspaceType">Workspace type</label>
      <select id="workspaceType" value={formData.workspaceType}
        onChange={(e) =>
          setFormData({...formData, workspaceType: e.target.value as "Public" | "Private",})
        }>
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </select>
      <button type="button" className="modal-continue" onClick={handleContinue} disabled={!formData.workspaceName.trim()}>
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div className="profile-section">
        <div className="profile-upload">
          <div className="photo-circle-wrapper-add" onClick={triggerFileInput}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="photo-circle-preview-add" />
            ) : (
            <div className="photo-circle-placeholder"><img className="photo-size-camera" src={camera}/></div>
            )}
          </div>
          <div>
            <h3 className="text-step2-add">Add a profile photo</h3>
            <button type="button" className="upload-btn" onClick={triggerFileInput}>
              {formData.profileImage ? "Change Image" : "Upload"}
            </button>
          </div>
          <input className="hidde-text-add-workspace" type="file" accept="image/*" ref={fileInputRef}
           onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              ImageSelect(file);
            }
          }}/>
          {/* {formData.profileImage && (
            <p className="selected-file">Selected: {formData.profileImage.name}</p>
          )} */}
          
        </div>
      </div>
      <div>
        <label htmlFor="workspaceDescription">
          Workspace description <span className="optional">Optional</span>
        </label>
        <textarea id="workspaceDescription" placeholder="Our team organizes everything here." rows={4} value={formData.workspaceDescription}
          onChange={(e) =>
            setFormData({ ...formData, workspaceDescription: e.target.value })
          }/>
        <p className="description-help">
          Get your members on board with a few words about your Workspace.
        </p>
        <button type="button" className="modal-continue" onClick={handleContinue} disabled={creating}>
          {creating ? "Creating workspace..." : "Create Workspace"}
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-3-complete-full">
      <div className="step-3-image-placeholder">
        <img src={createfinishworkspace} alt="Workspace created" />
      </div>
      <h2 className="step-3-title">Workspace created!</h2>
      <p className="step-3-subtitle">Your Workspace is ready</p>
      <p className="step-3-text">Press 'Continue' to start using your Workspace</p>
      <button type="button" className="copy-link-btn" onClick={copyInviteLink}>
       Copy link
      </button>
      <button type="button" className="modal-continue-finish" onClick={handleContinue}>
        Finish
      </button>
    </div>
  );
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Let's build a Workspace";
      case 2:
        return "";
      default:
        return "";
    }
  };
  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Boost your productivity by making it easier for everyone to access boards in one location.";
      case 2:
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        {currentStep === 3 ? (
          <div className="step-3-complete-full">
            {renderStep3()}
          </div>
        ) : (
          <>
            <div className="modal-left">
              <h2 className="modal-title">{getStepTitle()}</h2>
              <p className="modal-subtitle">{getStepSubtitle()}</p>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              <div className="modal-steps">
                {[1, 2].map((step) => (
                  <span key={step} className={`stepaddworkspace ${currentStep >= step ? "active" : ""}`}/>
                ))}
              </div>
            </div>
            <div className="modal-right">
              <img src={createworkspace} alt="Workspace" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiStepModal;