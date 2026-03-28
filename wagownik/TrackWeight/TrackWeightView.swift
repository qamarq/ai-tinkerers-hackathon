//
//  TrackWeightView.swift
//  TrackWeight
//

import SwiftUI

struct TrackWeightView: View {
    @StateObject private var viewModel = WeighingViewModel()

    var body: some View {
        VStack(spacing: 0) {
            // Top bar
            HStack {
                Text("Guided Mode")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color.gotownikMutedForeground)

                Spacer()

                // Step indicator
                if viewModel.state != .welcome {
                    StepIndicator(state: viewModel.state)
                }
            }
            .padding(.horizontal, 32)
            .padding(.top, 20)
            .padding(.bottom, 8)

            // Content
            VStack(spacing: 0) {
                switch viewModel.state {
                case .welcome:
                    WelcomeView { viewModel.startWeighing() }
                case .waitingForFinger:
                    FingerTimerView(
                        progress: viewModel.fingerTimer,
                        hasDetectedFinger: viewModel.fingerTimer > 0
                    )
                case .waitingForItem:
                    InstructionView(
                        title: "Place your item",
                        subtitle: "While maintaining contact, gently place your item on the trackpad.",
                        hint: "Use minimal finger pressure",
                        icon: "cube.box"
                    )
                case .weighing:
                    WeighingView(
                        currentPressure: viewModel.currentPressure,
                        isStabilizing: viewModel.isStabilizing,
                        stabilityProgress: viewModel.stabilityProgress
                    )
                case .result(let weight):
                    ResultView(weight: weight) { viewModel.restart() }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .animation(.easeInOut(duration: 0.5), value: viewModel.state)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.windowBackgroundColor))
    }
}

// MARK: - Step Indicator

struct StepIndicator: View {
    let state: WeighingState

    private var currentStep: Int {
        switch state {
        case .welcome: return 0
        case .waitingForFinger: return 1
        case .waitingForItem: return 2
        case .weighing: return 3
        case .result: return 4
        }
    }

    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...4, id: \.self) { step in
                Capsule()
                    .fill(step <= currentStep ? Color.gotownikPrimary : Color.gotownikBorder)
                    .frame(width: step == currentStep ? 20 : 8, height: 4)
                    .animation(.spring(response: 0.4, dampingFraction: 0.8), value: currentStep)
            }
        }
    }
}

// MARK: - Welcome

struct WelcomeView: View {
    let onStart: () -> Void

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            VStack(spacing: 20) {
                Image(systemName: "scalemass")
                    .font(.system(size: 48, weight: .thin))
                    .foregroundStyle(Color.gotownikPrimary)
                    .slideUpFade(delay: 0.05)

                VStack(spacing: 8) {
                    Text("Guided Weighing")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.primary)

                    Text("Step-by-step calibration for accurate results")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Color.gotownikMutedForeground)
                }
                .slideUpFade(delay: 0.15)
            }

            Spacer()

            Button(action: onStart) {
                HStack(spacing: 8) {
                    Text("Start")
                    Image(systemName: "arrow.right")
                        .font(.system(size: 12, weight: .semibold))
                }
            }
            .buttonStyle(GotownikButtonStyle(size: .large))
            .slideUpFade(delay: 0.3)
            .padding(.bottom, 40)
        }
    }
}

// MARK: - Finger Timer

struct FingerTimerView: View {
    let progress: Float
    let hasDetectedFinger: Bool

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            // Progress ring
            ZStack {
                Circle()
                    .stroke(Color.gotownikBorder, lineWidth: 3)
                    .frame(width: 120, height: 120)

                if hasDetectedFinger {
                    Circle()
                        .trim(from: 0, to: CGFloat(progress))
                        .stroke(Color.gotownikPrimary, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        .frame(width: 120, height: 120)
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 0.1), value: progress)
                }

                VStack(spacing: 4) {
                    if hasDetectedFinger {
                        Text("\(Int((1 - progress) * 3) + 1)")
                            .font(.system(size: 36, weight: .bold, design: .monospaced))
                            .foregroundStyle(Color.gotownikPrimary)
                            .contentTransition(.numericText())
                    } else {
                        Image(systemName: "hand.point.up.left")
                            .font(.system(size: 32, weight: .thin))
                            .foregroundStyle(Color.gotownikMutedForeground)
                    }
                }
            }

            VStack(spacing: 8) {
                Text("Hold your finger steady")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.primary)

                Text("Keep contact for 3 seconds to calibrate")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
            }

            Spacer()
        }
    }
}

// MARK: - Instruction

struct InstructionView: View {
    let title: String
    let subtitle: String
    let hint: String?
    let icon: String

    init(title: String, subtitle: String, hint: String? = nil, icon: String) {
        self.title = title
        self.subtitle = subtitle
        self.hint = hint
        self.icon = icon
    }

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.gotownikPrimary.opacity(0.08))
                    .frame(width: 100, height: 100)

                Image(systemName: icon)
                    .font(.system(size: 36, weight: .thin))
                    .foregroundStyle(Color.gotownikPrimary)
            }

            VStack(spacing: 10) {
                Text(title)
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.primary)

                Text(subtitle)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 320)

                if let hint = hint {
                    Text(hint)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.gotownikAmber)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 5)
                        .background(
                            Capsule()
                                .fill(Color.gotownikPrimary.opacity(0.1))
                        )
                        .padding(.top, 4)
                }
            }

            Spacer()
        }
    }
}

// MARK: - Weighing

struct WeighingView: View {
    let currentPressure: Float
    let isStabilizing: Bool
    let stabilityProgress: Float

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 6) {
                Text(String(format: "%.1f", currentPressure))
                    .font(.system(size: 72, weight: .bold, design: .monospaced))
                    .foregroundStyle(Color.gotownikPrimary)
                    .animation(.easeInOut(duration: 0.15), value: currentPressure)

                Text("grams")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
            }

            if isStabilizing {
                VStack(spacing: 10) {
                    // Progress track
                    ZStack(alignment: .leading) {
                        Capsule()
                            .fill(Color.gotownikBorder)
                            .frame(width: 200, height: 4)

                        Capsule()
                            .fill(Color.gotownikPrimary)
                            .frame(width: 200 * CGFloat(stabilityProgress), height: 4)
                            .animation(.linear(duration: 0.1), value: stabilityProgress)
                    }

                    Text("Stabilizing...")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Color.gotownikMutedForeground)
                }
                .transition(.opacity.combined(with: .move(edge: .bottom)))
            } else {
                Text("Maintain light contact")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(Color.gotownikSecondary)
                    )
            }

            Spacer()
        }
    }
}

// MARK: - Result

struct ResultView: View {
    let weight: Float
    let onRestart: () -> Void
    @State private var checkScale: CGFloat = 0.5
    @State private var checkOpacity: Double = 0

    var body: some View {
        VStack(spacing: 28) {
            Spacer()

            // Success indicator
            ZStack {
                Circle()
                    .fill(Color.gotownikPrimary.opacity(0.08))
                    .frame(width: 100, height: 100)

                Image(systemName: "checkmark")
                    .font(.system(size: 36, weight: .medium))
                    .foregroundStyle(Color.gotownikPrimary)
            }
            .scaleEffect(checkScale)
            .opacity(checkOpacity)
            .onAppear {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.1)) {
                    checkScale = 1.0
                    checkOpacity = 1.0
                }
            }

            VStack(spacing: 4) {
                Text(String(format: "%.1f", weight))
                    .font(.system(size: 56, weight: .bold, design: .monospaced))
                    .foregroundStyle(Color.primary)

                Text("grams")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(Color.gotownikMutedForeground)
            }

            Spacer()

            Button(action: onRestart) {
                HStack(spacing: 6) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 12, weight: .semibold))
                    Text("Weigh Again")
                }
            }
            .buttonStyle(GotownikButtonStyle(size: .default, variant: .secondary))
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    TrackWeightView()
}
