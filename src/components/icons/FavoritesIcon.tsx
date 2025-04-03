import styled from 'styled-components';

const IconContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.div`
  width: 48px;
  height: 48px;
  background-image: url('/assets/icons/favorites.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const FavoritesIcon = () => {
  return (
    <IconContainer>
      <Icon />
    </IconContainer>
  );
};

export default FavoritesIcon; 