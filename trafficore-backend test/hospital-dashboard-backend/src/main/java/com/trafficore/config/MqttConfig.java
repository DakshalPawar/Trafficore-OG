package com.trafficore.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class MqttConfig {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    @Value("${mqtt.client.username}")
    private String username;

    @Value("${mqtt.client.password}")
    private String password;

    @Value("${mqtt.connection.timeout}")
    private Integer connectionTimeout;

    @Value("${mqtt.topic.patient}")
    private String patientTopic;

    @Value("${mqtt.topic.gps}")
    private String gpsTopic;

    @Value("${mqtt.topic.chat.doctor}")
    private String doctorChatTopic;

    @Value("${mqtt.topic.chat.ambulance}")
    private String ambulanceChatTopic;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();

        options.setServerURIs(new String[]{brokerUrl});
        options.setCleanSession(true);
        options.setAutomaticReconnect(true);
        options.setConnectionTimeout(connectionTimeout);

        if (username != null && !username.isEmpty()) {
            options.setUserName(username);
        }
        if (password != null && !password.isEmpty()) {
            options.setPassword(password.toCharArray());
        }

        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageProducer inbound() {
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        brokerUrl,
                        clientId + "_inbound",
                        mqttClientFactory(),
                        patientTopic,
                        gpsTopic,
                        doctorChatTopic,
                        ambulanceChatTopic
                );

        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel());

        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler mqttMessageHandler() {
        log.info("MQTT Message Handler initialized");
        return message -> {
            String topic = message.getHeaders().get("mqtt_receivedTopic", String.class);
            String payload = message.getPayload().toString();
            log.debug("MQTT Message Received - Topic: {}, Payload: {}", topic, payload);
        };
    }
}