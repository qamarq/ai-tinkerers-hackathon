//
//  DebugView.swift
//  TrackWeight
//

import OpenMultitouchSupport
import SwiftUI

struct DebugView: View {
    @StateObject var viewModel = ContentViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Debug Console")
                        .font(.system(size: 18, weight: .bold, design: .rounded))

                    Text("Raw multitouch data")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color.gotownikMutedForeground)
                }

                Spacer()

                Button(action: { dismiss() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color.gotownikMutedForeground)
                        .frame(width: 28, height: 28)
                        .background(
                            Circle()
                                .fill(Color.gotownikSecondary)
                        )
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal, 24)
            .padding(.top, 20)
            .padding(.bottom, 16)

            // Device selector
            if !viewModel.availableDevices.isEmpty {
                HStack(spacing: 12) {
                    Text("Device")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(Color.gotownikMutedForeground)

                    Picker("", selection: Binding(
                        get: { viewModel.selectedDevice },
                        set: { device in
                            if let device = device {
                                viewModel.selectDevice(device)
                            }
                        }
                    )) {
                        ForEach(viewModel.availableDevices, id: \.self) { device in
                            Text("\(device.deviceName) (ID: \(device.deviceID))")
                                .tag(device as OMSDeviceInfo?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())

                    Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 12)
            }

            // Controls
            HStack {
                Button(action: {
                    if viewModel.isListening { viewModel.stop() } else { viewModel.start() }
                }) {
                    HStack(spacing: 6) {
                        Image(systemName: viewModel.isListening ? "stop.fill" : "play.fill")
                            .font(.system(size: 10))
                        Text(viewModel.isListening ? "Stop" : "Start")
                    }
                }
                .buttonStyle(GotownikButtonStyle(size: .small, variant: viewModel.isListening ? .secondary : .primary))

                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 16)

            // Canvas
            Canvas { context, size in
                viewModel.touchData.forEach { touch in
                    let path = makeEllipse(touch: touch, size: size)
                    context.fill(path, with: .color(Color.gotownikPrimary.opacity(Double(touch.total))))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(.controlBackgroundColor))
            .overlay(
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.gotownikBorder, lineWidth: 1)
            )
            .padding(.horizontal, 24)
            .padding(.bottom, 20)
        }
        .fixedSize(horizontal: false, vertical: false)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onAppear { viewModel.onAppear() }
        .onDisappear { viewModel.onDisappear() }
    }

    private func makeEllipse(touch: OMSTouchData, size: CGSize) -> Path {
        let x = Double(touch.position.x) * size.width
        let y = Double(1.0 - touch.position.y) * size.height
        let u = size.width / 100.0
        let w = Double(touch.axis.major) * u
        let h = Double(touch.axis.minor) * u
        return Path(ellipseIn: CGRect(x: -0.5 * w, y: -0.5 * h, width: w, height: h))
            .rotation(.radians(Double(-touch.angle)), anchor: .topLeading)
            .offset(x: x, y: y)
            .path(in: CGRect(origin: .zero, size: size))
    }
}

#Preview {
    DebugView()
}
