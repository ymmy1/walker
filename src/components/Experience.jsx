import {
  Environment,
  OrbitControls,
  OrthographicCamera,
} from '@react-three/drei';
import { useControls } from 'leva';
import { useRef } from 'react';
import { Map } from './Map';
import { Physics } from '@react-three/rapier';
import { CharacterController } from './CharacterController';
import { maps } from '../components/maps';

export const Experience = () => {
  const shadowCameraRef = useRef();
  const { map } = useControls('Map', {
    map: {
      value: 'city_scene_tokyo',
      options: Object.keys(maps),
    },
  });

  return (
    <>
      {/* <OrbitControls /> */}
      <Environment preset='sunset' />
      <directionalLight
        intensity={0.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={'shadow-camera'}
        />
      </directionalLight>
      <Physics key={map}>
        <Map
          scale={maps[map].scale}
          position={maps[map].position}
          model={`models/${map}.glb`}
        />
        <CharacterController characterRotation={maps[map].initialRotation} />
      </Physics>
    </>
  );
};
