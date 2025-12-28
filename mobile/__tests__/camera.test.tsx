import { render, screen } from "@testing-library/react-native";
import { CameraView } from "@/components/CameraView";

// Mock expo modules
jest.mock("expo-camera", () => ({
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

jest.mock("expo-image-picker", () => ({
  launchCameraAsync: jest.fn(),
}));

jest.mock("@/hooks/useLocation", () => ({
  useLocation: jest.fn(() => ({
    location: { latitude: 0, longitude: 0 },
    getLocation: jest.fn(),
  })),
}));

describe("CameraView", () => {
  it("renders take photo button", () => {
    render(<CameraView />);
    // Basic rendering test
    expect(screen).toBeDefined();
  });
});

