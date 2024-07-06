import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useControls } from 'leva';
import { useEffect, useRef, useState } from 'react';
import { MathUtils, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { Character } from './Character';

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = ({ characterRotation }) => {
  console.log(characterRotation);
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, FLY_FORCE } = useControls(
    'Character Control',
    {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      FLY_FORCE: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(4),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
    }
  );
  // Camera distance limits
  const MIN_CAMERA_DISTANCE_Y = 0.5;
  const MAX_CAMERA_DISTANCE_Y = 1.5;
  const MIN_CAMERA_DISTANCE_Z = -1;
  const MAX_CAMERA_DISTANCE_Z = -40;

  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const [animation, setAnimation] = useState('idle');

  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(characterRotation);
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());
  const [, get] = useKeyboardControls();
  const isClicking = useRef(false);

  useEffect(() => {
    const onMouseDown = (e) => {
      isClicking.current = true;
    };
    const onMouseUp = (e) => {
      isClicking.current = false;
    };
    // touch
    document.addEventListener('touchstart', onMouseDown);
    document.addEventListener('touchend', onMouseUp);
    return () => {
      document.removeEventListener('touchstart', onMouseDown);
      document.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  useFrame(({ camera, mouse }) => {
    if (rb.current) {
      const vel = rb.current.linvel();

      const movement = {
        x: 0,
        z: 0,
        y: 0,
      };

      if (get().forward) {
        movement.z = 1;
      }
      if (get().backward) {
        movement.z = -1;
      }

      if (get().fly) {
        movement.y = +1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (isClicking.current) {
        if (Math.abs(mouse.x) > 0.1) {
          movement.x = -mouse.x;
        }
        movement.z = mouse.y + 0.4;
        if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.5) {
          speed = RUN_SPEED;
        }
      }

      if (get().left) {
        movement.x = 1;
      }
      if (get().right) {
        movement.x = -1;
      }

      if (movement.x !== 0) {
        rotationTarget.current += ROTATION_SPEED * movement.x;
      }

      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z);
        vel.x =
          Math.sin(rotationTarget.current + characterRotationTarget.current) *
          speed;
        vel.z =
          Math.cos(rotationTarget.current + characterRotationTarget.current) *
          speed;
        if (speed === RUN_SPEED) {
          setAnimation('run');
        } else {
          setAnimation('walk');
        }
      } else {
        setAnimation('idle');
      }

      if (movement.y !== 0) {
        vel.y = movement.y * FLY_FORCE;
        setAnimation('jump up');
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      );

      rb.current.setLinvel(vel, true);
    }

    // CAMERA
    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      0.1
    );
    if (get().zoomIn) {
      if (cameraPosition.current.position.z < MIN_CAMERA_DISTANCE_Z) {
        cameraPosition.current.position.z += 0.1; // Adjust the zoom speed as needed
      }

      if (cameraPosition.current.position.y > MIN_CAMERA_DISTANCE_Y) {
        cameraPosition.current.position.y -= 0.1; // Adjust the zoom speed as needed
      }
    }

    // Zoom Out
    if (get().zoomOut) {
      if (cameraPosition.current.position.z > MAX_CAMERA_DISTANCE_Z) {
        cameraPosition.current.position.z -= 0.1; // Adjust the zoom speed as needed
      }

      if (cameraPosition.current.position.y < MAX_CAMERA_DISTANCE_Y) {
        cameraPosition.current.position.y += 0.1; // Adjust the zoom speed as needed
      }
    }

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    camera.position.lerp(cameraWorldPosition.current, 0.1);

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

      camera.lookAt(cameraLookAt.current);
    }
  });

  return (
    <RigidBody colliders={false} lockRotations ref={rb}>
      <group ref={container}>
        <group ref={cameraTarget} position-z={1.5} />
        <group ref={cameraPosition} position-y={0.5} position-z={-2} />
        <group ref={character}>
          <Character scale={0.18} position-y={-0.25} animation={animation} />
        </group>
      </group>
      <CapsuleCollider args={[0.08, 0.15]} />
    </RigidBody>
  );
};
