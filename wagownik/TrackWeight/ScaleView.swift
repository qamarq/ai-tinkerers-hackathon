//
//  ScaleView.swift
//  TrackWeight
//

import SwiftUI

struct ScaleView: View {
    @StateObject private var viewModel = ScaleViewModel()
    @State private var scaleCompression: CGFloat = 0
    @State private var displayShake = false
    @State private var particleOffset: CGFloat = 0
    @State private var keyMonitor: Any?

    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Top bar
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Gotownik")
                            .font(.system(size: 20, weight: .bold, design: .rounded))
                            .foregroundStyle(Color.primary)

                        Text(viewModel.hasTouch ? "Reading..." : "Place finger to begin")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Color.gotownikMutedForeground)
                            .animation(.easeInOut(duration: 0.3), value: viewModel.hasTouch)
                    }

                    Spacer()

                    // Live indicator
                    HStack(spacing: 6) {
                        Circle()
                            .fill(viewModel.hasTouch ? Color.gotownikPrimary : Color.gotownikBorder)
                            .frame(width: 7, height: 7)
                            .animation(.easeInOut(duration: 0.4), value: viewModel.hasTouch)

                        Text(viewModel.hasTouch ? "Active" : "Idle")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(viewModel.hasTouch ? Color.primary : Color.gotownikMutedForeground)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(
                        Capsule()
                            .fill(Color.gotownikSecondary)
                            .overlay(Capsule().stroke(Color.gotownikBorder.opacity(0.5), lineWidth: 1))
                    )
                }
                .padding(.horizontal, 32)
                .padding(.top, 24)
                .padding(.bottom, 16)

                Spacer()

                // Scale visualization
                CartoonScaleView(
                    weight: viewModel.currentWeight,
                    hasTouch: viewModel.hasTouch,
                    compression: $scaleCompression,
                    displayShake: $displayShake,
                    scaleFactor: min(geometry.size.width / 700, geometry.size.height / 550)
                )

                Spacer()

                // Bottom controls
                VStack(spacing: 12) {
                    if viewModel.pendingMeasurementId != nil {
                        if viewModel.submitSuccess {
                            HStack(spacing: 6) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundStyle(Color.gotownikPrimary)
                                Text("Sent!")
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(Color.gotownikPrimary)
                            }
                            .transition(.opacity.combined(with: .scale(scale: 0.9)))
                        } else {
                            Text("Press Enter to submit weight")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundStyle(Color.gotownikPrimary)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 6)
                                .background(
                                    Capsule()
                                        .fill(Color.gotownikPrimary.opacity(0.12))
                                        .overlay(Capsule().stroke(Color.gotownikPrimary.opacity(0.3), lineWidth: 1))
                                )
                                .transition(.opacity.combined(with: .scale(scale: 0.9)))
                        }
                    }

                    if viewModel.hasTouch {
                        Text("Spacebar to zero")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Color.gotownikMutedForeground)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 5)
                            .background(
                                Capsule()
                                    .fill(Color.gotownikSecondary)
                            )
                            .transition(.opacity.combined(with: .scale(scale: 0.9)))
                    }

                    Button(action: { viewModel.zeroScale() }) {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.clockwise")
                                .font(.system(size: 13, weight: .semibold))
                            Text("Zero")
                        }
                    }
                    .buttonStyle(GotownikButtonStyle(size: .small, variant: .secondary))
                    .opacity(viewModel.hasTouch ? 1 : 0)
                    .scaleEffect(viewModel.hasTouch ? 1 : 0.9)
                    .animation(.spring(response: 0.4, dampingFraction: 0.8), value: viewModel.hasTouch)
                }
                .frame(height: 96)
                .padding(.bottom, 24)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .focusable()
        .modifier(FocusEffectModifier())
        .onChange(of: viewModel.currentWeight) { newWeight in
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                scaleCompression = CGFloat(min(newWeight / 100.0, 0.2))
            }
        }
        .onAppear {
            viewModel.startListening()
            setupKeyMonitoring()
        }
        .onDisappear {
            viewModel.stopListening()
            removeKeyMonitoring()
        }
    }

    private func setupKeyMonitoring() {
        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            print("[Key] keyCode=\(event.keyCode), pendingId=\(String(describing: viewModel.pendingMeasurementId)), weight=\(viewModel.currentWeight)")
            if event.keyCode == 49 && viewModel.hasTouch {
                viewModel.zeroScale()
            }
            // Enter key (keyCode 36) to submit weight
            if event.keyCode == 36 && viewModel.pendingMeasurementId != nil {
                print("[Key] Submitting weight!")
                viewModel.submitWeight()
            }
            return event
        }
    }

    private func removeKeyMonitoring() {
        if let monitor = keyMonitor {
            NSEvent.removeMonitor(monitor)
            keyMonitor = nil
        }
    }
}

struct CartoonScaleView: View {
    let weight: Float
    let hasTouch: Bool
    @Binding var compression: CGFloat
    @Binding var displayShake: Bool
    let scaleFactor: CGFloat

    var body: some View {
        VStack(spacing: 0) {
            // Scale platform
            RoundedRectangle(cornerRadius: 6)
                .fill(
                    LinearGradient(
                        colors: [Color.gotownikBorder, Color.gotownikBorder.opacity(0.7)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 200 * scaleFactor, height: 10 * scaleFactor)
                .shadow(color: .black.opacity(0.06), radius: 2, x: 0, y: 1)
                .offset(y: compression * 12)

            // Scale body
            ZStack {
                // Main housing
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(.controlBackgroundColor))
                    .frame(width: 250 * scaleFactor, height: 150 * scaleFactor)
                    .overlay(
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(Color.gotownikBorder.opacity(0.6), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.06), radius: 12, x: 0, y: 6)
                    .shadow(color: .black.opacity(0.02), radius: 1, x: 0, y: 1)

                // Display screen
                VStack(spacing: 0) {
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.gotownikPrimary)
                        .frame(width: 180 * scaleFactor, height: 64 * scaleFactor)
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .fill(Color.black.opacity(0.1))
                                .padding(1)
                        )
                        .overlay(
                            VStack(spacing: 1) {
                                Text(String(format: "%.1f", weight))
                                    .font(.system(size: 30 * scaleFactor, weight: .bold, design: .monospaced))
                                    .foregroundStyle(.white)
                                    .shadow(color: Color.gotownikDarkAmber.opacity(0.3), radius: 1, x: 0, y: 1)
                                    .animation(.easeInOut(duration: 0.15), value: weight)

                                Text("g")
                                    .font(.system(size: 11 * scaleFactor, weight: .semibold))
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                        )
                }
                .offset(y: -12 * scaleFactor)

                // Status LED
                Circle()
                    .fill(hasTouch ? Color.white : Color.white.opacity(0.3))
                    .frame(width: 5 * scaleFactor, height: 5 * scaleFactor)
                    .shadow(color: hasTouch ? Color.white.opacity(0.6) : .clear, radius: 3)
                    .offset(x: 82 * scaleFactor, y: -38 * scaleFactor)
                    .animation(.easeInOut(duration: 0.3), value: hasTouch)

                // Minimal face
                VStack(spacing: 6 * scaleFactor) {
                    HStack(spacing: 14 * scaleFactor) {
                        Circle()
                            .fill(Color.gotownikBorder)
                            .frame(width: 6 * scaleFactor, height: 6 * scaleFactor)
                        Circle()
                            .fill(Color.gotownikBorder)
                            .frame(width: 6 * scaleFactor, height: 6 * scaleFactor)
                    }

                    Group {
                        if hasTouch && weight > 5 {
                            Path { path in
                                path.move(to: CGPoint(x: 0, y: 0))
                                path.addQuadCurve(to: CGPoint(x: 16, y: 0), control: CGPoint(x: 8, y: 8))
                            }
                            .stroke(Color.gotownikBorder, lineWidth: 1.5 * scaleFactor)
                            .frame(width: 16 * scaleFactor, height: 8 * scaleFactor)
                        } else {
                            RoundedRectangle(cornerRadius: 1)
                                .fill(Color.gotownikBorder)
                                .frame(width: 10 * scaleFactor, height: 1.5 * scaleFactor)
                        }
                    }
                    .animation(.easeInOut(duration: 0.3), value: weight > 5)
                }
                .offset(y: 48 * scaleFactor)
            }

            // Feet
            HStack(spacing: 140 * scaleFactor) {
                ForEach(0..<2, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.gotownikBorder)
                        .frame(width: 10 * scaleFactor, height: 20 * scaleFactor)
                        .offset(y: compression * 3)
                }
            }
            .offset(y: -4)
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: compression)
    }
}

struct FocusEffectModifier: ViewModifier {
    func body(content: Content) -> some View {
        if #available(macOS 14.0, *) {
            content.focusEffectDisabled()
        } else {
            content
        }
    }
}

#Preview {
    ScaleView()
}
