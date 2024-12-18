import {
  ModelArtifact,
  ModelArtifactState,
  ModelState,
  ModelVersion,
  RegisteredModel,
} from '~/concepts/modelRegistry/types';
import { ModelRegistryAPIState } from '~/concepts/modelRegistry/context/useModelRegistryAPIState';
import { objectStorageFieldsToUri } from '~/concepts/modelRegistry/utils';
import {
  ModelLocationType,
  RegisterModelFormData,
  RegisterVersionFormData,
  RegistrationCommonFormData,
} from './useRegisterModelData';
import { MR_CHARACTER_LIMIT } from './const';

export type RegisterModelCreatedResources = RegisterVersionCreatedResources & {
  registeredModel: RegisteredModel;
};

export type RegisterVersionCreatedResources = {
  modelVersion: ModelVersion;
  modelArtifact: ModelArtifact;
};

export const registerModel = async (
  apiState: ModelRegistryAPIState,
  formData: RegisterModelFormData,
  author: string,
): Promise<RegisterModelCreatedResources> => {
  const registeredModel = await apiState.api.createRegisteredModel(
    {},
    {
      name: formData.modelName,
      description: formData.modelDescription,
      customProperties: {},
      owner: author,
      state: ModelState.LIVE,
    },
  );
  const { modelVersion, modelArtifact } = await registerVersion(
    apiState,
    registeredModel,
    formData,
    author,
  );
  return { registeredModel, modelVersion, modelArtifact };
};

export const registerVersion = async (
  apiState: ModelRegistryAPIState,
  registeredModel: RegisteredModel,
  formData: Omit<RegisterVersionFormData, 'registeredModelId'>,
  author: string,
): Promise<RegisterVersionCreatedResources> => {
  const modelVersion = await apiState.api.createModelVersionForRegisteredModel(
    {},
    registeredModel.id,
    {
      name: formData.versionName,
      description: formData.versionDescription,
      customProperties: {},
      state: ModelState.LIVE,
      author,
      registeredModelId: registeredModel.id,
    },
  );
  const modelArtifact = await apiState.api.createModelArtifactForModelVersion({}, modelVersion.id, {
    name: `${formData.versionName}`,
    description: formData.versionDescription,
    customProperties: {},
    state: ModelArtifactState.LIVE,
    author,
    modelFormatName: formData.sourceModelFormat,
    modelFormatVersion: formData.sourceModelFormatVersion,
    // TODO fill in the name of the data connection we used to prefill if we used one
    // TODO this should be done as part of https://issues.redhat.com/browse/RHOAIENG-9914
    // storageKey: 'TODO',
    uri:
      formData.modelLocationType === ModelLocationType.ObjectStorage
        ? objectStorageFieldsToUri({
            endpoint: formData.modelLocationEndpoint,
            bucket: formData.modelLocationBucket,
            region: formData.modelLocationRegion,
            path: formData.modelLocationPath,
          }) || '' // We'll only hit this case if required fields are empty strings, so form validation should catch it.
        : formData.modelLocationURI,
    artifactType: 'model-artifact',
  });
  return { modelVersion, modelArtifact };
};

const isSubmitDisabledForCommonFields = (formData: RegistrationCommonFormData): boolean => {
  const {
    versionName,
    modelLocationType,
    modelLocationURI,
    modelLocationBucket,
    modelLocationEndpoint,
    modelLocationPath,
  } = formData;
  return (
    !versionName ||
    (modelLocationType === ModelLocationType.URI && !modelLocationURI) ||
    (modelLocationType === ModelLocationType.ObjectStorage &&
      (!modelLocationBucket || !modelLocationEndpoint || !modelLocationPath)) ||
    !isNameValid(versionName)
  );
};

export const isRegisterModelSubmitDisabled = (formData: RegisterModelFormData): boolean =>
  !formData.modelName ||
  isSubmitDisabledForCommonFields(formData) ||
  !isNameValid(formData.modelName);

export const isRegisterVersionSubmitDisabled = (formData: RegisterVersionFormData): boolean =>
  !formData.registeredModelId || isSubmitDisabledForCommonFields(formData);

export const isNameValid = (name: string): boolean => name.length <= MR_CHARACTER_LIMIT;
