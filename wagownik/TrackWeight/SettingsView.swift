//
//  SettingsView.swift
//  TrackWeight
//

import OpenMultitouchSupport
import SwiftUI

struct SettingsView: View {
    @StateObject private var viewModel = ContentViewModel()
    @State private var showDebugView = false

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Settings")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.primary)
                Spacer()
            }
            .padding(.horizontal, 32)
            .padding(.top, 28)
            .padding(.bottom, 24)

            // Cards
            VStack(spacing: 12) {
                // Device Card
                VStack(spacing: 16) {
                    HStack {
                        HStack(spacing: 10) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.gotownikPrimary.opacity(0.1))
                                    .frame(width: 32, height: 32)

                                Image(systemName: "rectangle.connected.to.line.below")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundStyle(Color.gotownikPrimary)
                            }

                            Text("Trackpad")
                                .font(.system(size: 14, weight: .semibold))
                        }

                        Spacer()

                        if !viewModel.availableDevices.isEmpty {
                            Text("\(viewModel.availableDevices.count) found")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(Color.gotownikMutedForeground)
                        }
                    }

                    if !viewModel.availableDevices.isEmpty {
                        Picker("", selection: Binding(
                            get: { viewModel.selectedDevice },
                            set: { device in
                                if let device = device {
                                    viewModel.selectDevice(device)
                                }
                            }
                        )) {
                            ForEach(viewModel.availableDevices, id: \.self) { device in
                                Text(device.deviceName)
                                    .tag(device as OMSDeviceInfo?)
                            }
                        }
                        .pickerStyle(MenuPickerStyle())
                    } else {
                        HStack {
                            Text("No trackpad detected")
                                .font(.system(size: 13, weight: .medium))
                                .foregroundStyle(Color.gotownikMutedForeground)
                            Spacer()
                        }
                    }
                }
                .padding(20)
                .gotownikCard()

                // Debug Card
                VStack {
                    Button(action: { showDebugView = true }) {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.gotownikSecondary)
                                    .frame(width: 32, height: 32)

                                Image(systemName: "terminal")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundStyle(Color.gotownikMutedForeground)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Debug Console")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.primary)

                                Text("Raw touch data & diagnostics")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(Color.gotownikMutedForeground)
                            }

                            Spacer()

                            Image(systemName: "chevron.right")
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(Color.gotownikMutedForeground)
                        }
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(CardButtonStyle())
                }
                .padding(20)
                .gotownikCard()
            }
            .frame(maxWidth: 480)
            .padding(.horizontal, 32)

            Spacer()

            // Footer
            Text("Gotownik v1.0")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Color.gotownikBorder)
                .padding(.bottom, 16)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(NSColor.windowBackgroundColor))
        .sheet(isPresented: $showDebugView) {
            DebugView()
                .frame(minWidth: 700, minHeight: 500)
        }
        .onAppear {
            viewModel.loadDevices()
        }
    }
}

struct SettingsCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack {
            content
        }
        .padding(20)
        .gotownikCard()
    }
}

struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.8 : 1.0)
            .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
    }
}

#Preview {
    SettingsView()
}
