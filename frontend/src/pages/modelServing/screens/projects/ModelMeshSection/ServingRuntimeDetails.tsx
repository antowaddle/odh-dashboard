import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  List,
  ListItem,
} from '@patternfly/react-core';
import { AppContext } from '~/app/AppContext';
import { InferenceServiceKind, ServingRuntimeKind } from '~/k8sTypes';
import { getServingRuntimeSizes } from '~/pages/modelServing/screens/projects/utils';
import useServingAcceleratorProfileFormState from '~/pages/modelServing/screens/projects/useServingAcceleratorProfileFormState';
import { getResourceSize } from '~/pages/modelServing/utils';
import { formatMemory } from '~/utilities/valueUnits';

type ServingRuntimeDetailsProps = {
  obj: ServingRuntimeKind;
  isvc?: InferenceServiceKind;
};

const ServingRuntimeDetails: React.FC<ServingRuntimeDetailsProps> = ({ obj, isvc }) => {
  const { dashboardConfig } = React.useContext(AppContext);
  const { initialState: initialAcceleratorProfileState } = useServingAcceleratorProfileFormState(
    obj,
    isvc,
  );
  const enabledAcceleratorProfiles = initialAcceleratorProfileState.acceleratorProfiles.filter(
    (ac) => ac.spec.enabled,
  );
  const resources = isvc?.spec.predictor.model?.resources || obj.spec.containers[0].resources;
  const sizes = getServingRuntimeSizes(dashboardConfig);
  const size = sizes.find(
    (currentSize) => getResourceSize(sizes, resources || {}).name === currentSize.name,
  );

  return (
    <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '250px' }}>
      <DescriptionListGroup>
        <DescriptionListTerm>Model server replicas</DescriptionListTerm>
        <DescriptionListDescription>
          {isvc?.spec.predictor.minReplicas || obj.spec.replicas || 'Unknown'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {resources && (
        <DescriptionListGroup>
          <DescriptionListTerm>Model server size</DescriptionListTerm>
          <DescriptionListDescription>
            <List isPlain>
              <ListItem>{size?.name || 'Custom'}</ListItem>
              <ListItem>
                {`${resources.requests?.cpu ?? ''} CPUs, ${formatMemory(
                  resources.requests?.memory ?? '',
                )} Memory requested`}
              </ListItem>
              <ListItem>
                {`${resources.limits?.cpu ?? ''} CPUs, ${formatMemory(
                  resources.limits?.memory ?? '',
                )} Memory limit`}
              </ListItem>
            </List>
          </DescriptionListDescription>
        </DescriptionListGroup>
      )}
      <DescriptionListGroup>
        <DescriptionListTerm>Accelerator</DescriptionListTerm>
        <DescriptionListDescription>
          {initialAcceleratorProfileState.acceleratorProfile
            ? `${initialAcceleratorProfileState.acceleratorProfile.spec.displayName}${
                !initialAcceleratorProfileState.acceleratorProfile.spec.enabled ? ' (disabled)' : ''
              }`
            : enabledAcceleratorProfiles.length === 0
            ? 'No accelerator enabled'
            : initialAcceleratorProfileState.unknownProfileDetected
            ? 'Unknown'
            : 'No accelerator selected'}
        </DescriptionListDescription>
      </DescriptionListGroup>
      {!initialAcceleratorProfileState.unknownProfileDetected &&
        initialAcceleratorProfileState.acceleratorProfile && (
          <DescriptionListGroup>
            <DescriptionListTerm>Number of accelerators</DescriptionListTerm>
            <DescriptionListDescription>
              {initialAcceleratorProfileState.count}
            </DescriptionListDescription>
          </DescriptionListGroup>
        )}
    </DescriptionList>
  );
};

export default ServingRuntimeDetails;
