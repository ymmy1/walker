import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { KeyboardControls } from '@react-three/drei';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'fly', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'zoomIn', keys: ['KeyN', 'ScrollUp'] },
  { name: 'zoomOut', keys: ['KeyM', 'ScrollDown'] },
];

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas shadows camera={{ position: [3, 3, 3], near: 0.1, fov: 40 }}>
        <color attach='background' args={['#ececec']} />
        <Experience />
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
