import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import React from 'react';
import FormSection from '~/components/pf-overrides/FormSection';
import { UpdateObjectAtPropAndValue } from '~/pages/projects/types';
import { MR_CHARACTER_LIMIT } from './const';
import { RegisterModelFormData } from './useRegisterModelData';

type RegisterModelDetailsFormSectionProp<D extends RegisterModelFormData> = {
  formData: D;
  setData: UpdateObjectAtPropAndValue<D>;
  hasModelNameError: boolean;
  isModelNameDuplicate?: boolean;
};
const RegisterModelDetailsFormSection = <D extends RegisterModelFormData>({
  formData,
  setData,
  hasModelNameError,
  isModelNameDuplicate,
}: RegisterModelDetailsFormSectionProp<D>): React.ReactNode => (
  <FormSection
    title="Model details"
    description="Provide general details that apply to all versions of this model."
  >
    <FormGroup label="Model name" isRequired fieldId="model-name">
      <TextInput
        isRequired
        type="text"
        id="model-name"
        name="model-name"
        value={formData.modelName}
        onChange={(_e, value) => setData('modelName', value)}
        validated={hasModelNameError ? 'error' : 'default'}
      />
      {hasModelNameError && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem variant="error" data-testid="model-name-error">
              {isModelNameDuplicate
                ? 'Model name already exists'
                : `Cannot exceed ${MR_CHARACTER_LIMIT} characters`}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
    <FormGroup label="Model description" fieldId="model-description">
      <TextArea
        type="text"
        id="model-description"
        name="model-description"
        value={formData.modelDescription}
        onChange={(_e, value) => setData('modelDescription', value)}
      />
    </FormGroup>
  </FormSection>
);

export default RegisterModelDetailsFormSection;
