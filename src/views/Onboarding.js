import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import AvatarUploader from '~/components/AvatarUploader';
// import Input from '~/components/Input';
import Mnemonic from '~/components/Mnemonic';
import OnboardingStepper from '~/components/OnboardingStepper';
import VerifiedEmailInput from '~/components/VerifiedEmailInput';
import VerifiedUsernameInput from '~/components/VerifiedUsernameInput';
import logError, { formatErrorMessage } from '~/utils/debug';
import notify, { NotificationsTypes } from '~/store/notifications/actions';
import translate from '~/services/locale';
import { WELCOME_PATH } from '~/routes';
import { createNewAccount } from '~/store/onboarding/actions';
import { showSpinnerOverlay, hideSpinnerOverlay } from '~/store/app/actions';
import { toSeedPhrase, getPrivateKey } from '~/services/wallet';

const Onboarding = () => {
  const dispatch = useDispatch();

  const [values, setValues] = useState({
    avatarUrl: '',
    email: '',
    username: '',
  });

  const onFinish = async () => {
    dispatch(showSpinnerOverlay());

    try {
      await dispatch(
        createNewAccount(values.username, values.email, values.avatarUrl),
      );

      dispatch(
        notify({
          text: translate('Onboarding.successOnboardingComplete'),
          type: NotificationsTypes.SUCCESS,
        }),
      );
    } catch (error) {
      logError(error);

      const errorMessage = formatErrorMessage(error);

      dispatch(
        notify({
          text: translate('Onboarding.errorSignup', {
            errorMessage,
          }),
          type: NotificationsTypes.ERROR,
        }),
      );
    }

    dispatch(hideSpinnerOverlay());
  };

  const steps = [
    OnboardingStepUsername,
    OnboardingStepEmail,
    OnboardingStepSeedPhrasePrimer,
    OnboardingStepSeedPhrase,
    OnboardingStepSeedChallenge1,
    OnboardingStepSeedChallenge2,
    OnboardingStepAvatar,
  ];

  return (
    <OnboardingStepper
      exitPath={WELCOME_PATH}
      steps={steps}
      values={values}
      onFinish={onFinish}
      onValuesChange={setValues}
    />
  );
};

const OnboardingStepUsername = ({ onDisabledChange, values, onChange }) => {
  const handleChange = (username) => {
    onChange({
      username,
    });
  };

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        {translate('Onboarding.headingUsername')}
      </Typography>
      <Typography>{translate('Onboarding.bodyUsername')}</Typography>
      <Box mt={4}>
        <VerifiedUsernameInput
          label={translate('Onboarding.formUsername')}
          value={values.username}
          onChange={handleChange}
          onStatusChange={onDisabledChange}
        />
      </Box>
    </Fragment>
  );
};

const OnboardingStepEmail = ({ values, onDisabledChange, onChange }) => {
  const handleChange = (email) => {
    onChange({
      email,
    });
  };

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        {translate('Onboarding.headingEmail')}
      </Typography>
      <Typography>{translate('Onboarding.bodyEmail')}</Typography>
      <Box mt={4}>
        <VerifiedEmailInput
          label={translate('Onboarding.formEmail')}
          value={values.email}
          onChange={handleChange}
          onStatusChange={onDisabledChange}
        />
      </Box>
    </Fragment>
  );
};

const OnboardingStepSeedPhrasePrimer = ({ onDisabledChange }) => {
  const [readyForPhrase, setReadyForPhrase] = useState(false);

  const handleCheck = ({ target: { checked } }) => {
    setReadyForPhrase(checked);
  };

  useEffect(() => {
    onDisabledChange(!readyForPhrase);
  });

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        Almost done
      </Typography>
      <Typography>
        Next, you will be given a list of 24 magic words which you need to write
        down and secure in a safe place.
      </Typography>
      <Typography>
        The entire list of words will be the only way you can recover access to
        your account.
      </Typography>
      <Typography>Keep it safe!</Typography>
      {/* {translate('Onboarding.bodySeedPhrase')}</Typography> */}
      <FormControlLabel
        checked={readyForPhrase}
        control={<Checkbox />}
        disabled={false}
        label="I have saved my seed phrase"
        onChange={handleCheck}
      />
    </Fragment>
  );
};

const OnboardingStepSeedPhrase = ({ onDisabledChange }) => {
  const [hasSavedPhrase, setHasSavedPhrase] = useState(false);

  const handleCheck = ({ target: { checked } }) => {
    setHasSavedPhrase(checked);
  };

  useEffect(() => {
    onDisabledChange(!hasSavedPhrase);
  });

  const mnemonic = useMemo(() => {
    const privateKey = getPrivateKey();
    return toSeedPhrase(privateKey);
  }, []);

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        Your magic words
        {/* {translate('Onboarding.headingSeedPhrase')} */}
      </Typography>
      <Box my={4}>
        <Mnemonic text={mnemonic} />
      </Box>
      <Typography>
        You will need to use your magic words to log in to your account and
        cannot be changed. Make sure you save them somewhere safe!
      </Typography>
      {/* {translate('Onboarding.bodySeedPhrase')}</Typography> */}
      <FormControlLabel
        checked={hasSavedPhrase}
        control={<Checkbox />}
        disabled={false}
        label="I have saved my seed phrase"
        onChange={handleCheck}
      />
    </Fragment>
  );
};

const OnboardingStepSeedChallenge = ({
  onDisabledChange,
  newWallet,
  hideBack,
}) => {
  const [clickInfo, setClickInfo] = useState({
    attemptsRemaining: 3,
    correct: false,
    lastClicked: null,
  });

  const wordIndex = useMemo(() => {
    return Math.floor(Math.random() * 24);
  }, []);

  const mnemonic = useMemo(() => {
    const privateKey = getPrivateKey();
    return toSeedPhrase(privateKey);
  }, []);

  useEffect(() => {
    hideBack(true);
    onDisabledChange(!clickInfo.correct);
  });

  const privateKey = getPrivateKey();
  const answer = toSeedPhrase(privateKey).split(' ')[wordIndex];

  const clickHandler = (key) => {
    // if (!clickInfo.correct) {
    if (key !== wordIndex) {
      setClickInfo({
        attemptsRemaining: clickInfo.attemptsRemaining - 1,
        correct: false,
        lastClicked: key,
      });
    } else {
      setClickInfo({
        correct: true,
        lastClicked: key,
      });
    }
  };

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        Where is the word {answer}?
        {/* {translate('Onboarding.headingSeedPhraseChallenge')} */}
      </Typography>
      <Typography>
        You have {clickInfo.attemptsRemaining} attempts remaining
        {/* {translate('Onboarding.bodySeedPhraseChallenge', {
          wordIndex: wordIndex + 1,
        })} */}
      </Typography>

      <Mnemonic
        attemptsRemaining={clickInfo.attemptsRemaining}
        clickHandler={clickHandler}
        clickedIndex={clickInfo.lastClicked}
        correctClicked={clickInfo.correct}
        correctIndex={wordIndex}
        newPhraseHandler={(goToStep) => newWallet(goToStep)}
        obfuscate
        text={mnemonic}
      />
    </Fragment>
  );
};

// Pure proxy components to generate new keys for each item
// and select new word

const OnboardingStepSeedChallenge1 = ({
  onDisabledChange,
  hideBack,
  newWallet,
}) => (
  <OnboardingStepSeedChallenge
    hideBack={(hide) => hideBack(hide)}
    newWallet={(goToStep) => newWallet(goToStep)}
    onDisabledChange={(state) => onDisabledChange(state)}
  />
);

const OnboardingStepSeedChallenge2 = ({
  onDisabledChange,
  hideBack,
  newWallet,
}) => (
  <OnboardingStepSeedChallenge
    hideBack={(hide) => hideBack(hide)}
    newWallet={(goToStep) => newWallet(goToStep)}
    onDisabledChange={(state) => onDisabledChange(state)}
  />
);

const OnboardingStepAvatar = ({ values, onDisabledChange, onChange }) => {
  const handleUpload = (avatarUrl) => {
    onChange({
      avatarUrl,
    });
  };

  return (
    <Fragment>
      <Typography align="center" gutterBottom variant="h2">
        {translate('Onboarding.headingAvatar')}
      </Typography>
      <Typography>{translate('Onboarding.bodyAvatar')}</Typography>
      <Box mt={4}>
        <AvatarUploader
          value={values.avatarUrl}
          onLoadingChange={onDisabledChange}
          onUpload={handleUpload}
        />
      </Box>
    </Fragment>
  );
};

const stepProps = {
  hideBack: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onDisabledChange: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
};

OnboardingStepUsername.propTypes = {
  ...stepProps,
};

OnboardingStepEmail.propTypes = {
  ...stepProps,
};

OnboardingStepSeedPhrasePrimer.propTypes = {
  ...stepProps,
};

OnboardingStepSeedPhrase.propTypes = {
  ...stepProps,
};

OnboardingStepSeedChallenge.propTypes = {
  hideBack: PropTypes.func.isRequired,
  newWallet: PropTypes.func.isRequired,
  onDisabledChange: PropTypes.func.isRequired,
};

OnboardingStepSeedChallenge1.propTypes = {
  hideBack: PropTypes.func.isRequired,
  newWallet: PropTypes.func.isRequired,
  onDisabledChange: PropTypes.func.isRequired,
};

OnboardingStepSeedChallenge2.propTypes = {
  hideBack: PropTypes.func.isRequired,
  newWallet: PropTypes.func.isRequired,
  onDisabledChange: PropTypes.func.isRequired,
};

OnboardingStepAvatar.propTypes = {
  ...stepProps,
};

export default Onboarding;
